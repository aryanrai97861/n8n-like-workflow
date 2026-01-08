from typing import Dict, Any, List
from app.schemas.workflow import Workflow, Node, ExecutionResponse
from app.services.llm import generate_response
from app.services.vector_store import query_documents
import asyncio

async def execute_workflow(workflow: Workflow, user_query: str) -> ExecutionResponse:
    """
    Execute a workflow by traversing the node graph.
    Supports: User Query -> Knowledge Base (optional) -> LLM Engine -> Output
    """
    
    # Build node map and adjacency list
    node_map = {node.id: node for node in workflow.nodes}
    adj_list = {node.id: [] for node in workflow.nodes}
    for edge in workflow.edges:
        if edge.source in adj_list:
            adj_list[edge.source].append(edge.target)

    # Calculate in-degrees for topological execution
    in_degree = {node.id: 0 for node in workflow.nodes}
    for edge in workflow.edges:
        in_degree[edge.target] += 1
    
    # Find starting nodes (should be User Query with in-degree 0)
    queue = [node.id for node in workflow.nodes if in_degree[node.id] == 0]
    
    if not queue:
        return ExecutionResponse(
            result="Error: No starting node found. Ensure User Query node has no incoming connections.",
            logs=["Workflow validation failed: No entry point"]
        )
    
    # Execution state
    visited = set()
    node_outputs = {}
    execution_logs = []
    final_output = ""
    
    # Store the original user query for LLM access
    original_query = user_query
    
    # BFS execution with topological ordering
    while queue:
        current_id = queue.pop(0)
        current_node = node_map[current_id]
        visited.add(current_id)
        
        execution_logs.append(f"Executing: {current_node.data.label or current_node.type} ({current_id})")
        
        try:
            # Determine input for this node from parent outputs
            parent_ids = [edge.source for edge in workflow.edges if edge.target == current_id]
            parent_outputs = [str(node_outputs.get(p, "")) for p in parent_ids]
            node_input = "\n".join(parent_outputs) if parent_outputs else ""
            
            # Execute node logic based on type
            output = ""
            
            if current_node.type == 'user_query':
                # User Query node outputs the user's question
                output = user_query
                execution_logs.append(f"User query captured: {user_query[:50]}...")
                
            elif current_node.type == 'knowledge_base':
                # Knowledge Base retrieves relevant context
                # Input should be the user query from parent
                query_text = node_input if node_input else user_query
                context = query_documents(query_text, n_results=3)
                
                if context:
                    # Output format: pass both query and context forward
                    output = f"CONTEXT:\n{context}\n\nQUERY:\n{query_text}"
                    execution_logs.append(f"Retrieved {len(context)} chars of context")
                else:
                    output = f"QUERY:\n{query_text}"
                    execution_logs.append("No relevant context found")
                    
            elif current_node.type == 'llm_engine':
                # LLM Engine processes query with optional context
                # Parse input to extract query and context
                prompt_text = current_node.data.config.get("prompt", "You are a helpful PDF assistant. Use web search if the PDF lacks context.\\n\\nCONTEXT: {context}\\nUser Query: {query}")
                api_key = current_node.data.config.get("apiKey")
                use_web_search = current_node.data.config.get("useWebSearch", False)
                model_name = current_node.data.config.get("model", "gemini-pro")
                temperature = float(current_node.data.config.get("temperature", 0.75))
                
                # Extract context and query from input
                context = ""
                query = original_query
                
                if "CONTEXT:" in node_input and "QUERY:" in node_input:
                    parts = node_input.split("QUERY:")
                    context = parts[0].replace("CONTEXT:", "").strip()
                    query = parts[1].strip() if len(parts) > 1 else original_query
                elif node_input:
                    # If no special format, treat input as query
                    query = node_input
                
                # Replace placeholders in prompt template
                if "{context}" in prompt_text and "{query}" in prompt_text:
                    final_prompt = prompt_text.replace("{context}", context).replace("{query}", query)
                elif prompt_text:
                    final_prompt = f"{prompt_text}\\n\\nContext: {context}\\n\\nUser Query: {query}" if context else f"{prompt_text}\\n\\n{query}"
                else:
                    final_prompt = f"Context: {context}\\n\\nUser Query: {query}" if context else query
                
                execution_logs.append(f"Using model: {model_name}")
                execution_logs.append(f"Temperature: {temperature}")
                if context:
                    execution_logs.append(f"Context length: {len(context)} chars")
                if use_web_search:
                    execution_logs.append("Web search enabled")
                    
                response = await generate_response(
                    prompt=final_prompt, 
                    context="",  # Context already included in prompt
                    api_key=api_key,
                    use_web_search=use_web_search,
                    model_name=model_name
                )
                output = response
                execution_logs.append("LLM response generated successfully")
                
            elif current_node.type == 'output':
                # Output node receives final result
                output = node_input
                final_output = output
                execution_logs.append("Output generated")
                
            else:
                execution_logs.append(f"Unknown node type: {current_node.type}")
                output = node_input
            
            # Store output for downstream nodes
            node_outputs[current_id] = output
            
        except Exception as e:
            error_msg = f"Error in {current_node.type} node: {str(e)}"
            execution_logs.append(error_msg)
            output = f"ERROR: {str(e)}"
            node_outputs[current_id] = output
        
        # Add child nodes to queue when all dependencies are met
        for neighbor_id in adj_list[current_id]:
            in_degree[neighbor_id] -= 1
            if in_degree[neighbor_id] == 0:
                queue.append(neighbor_id)
    
    # If no output node was found, return the last output
    if not final_output and node_outputs:
        final_output = list(node_outputs.values())[-1]
    
    return ExecutionResponse(result=final_output, logs=execution_logs)

