from typing import Dict, Any, List
from app.schemas.workflow import Workflow, Node, ExecutionResponse
from app.services.llm import generate_response
from app.services.vector_store import query_documents
import asyncio

async def execute_workflow(workflow: Workflow, user_query: str) -> ExecutionResponse:
    # 1. Build Graph
    node_map = {node.id: node for node in workflow.nodes}
    adj_list = {node.id: [] for node in workflow.nodes}
    for edge in workflow.edges:
        if edge.source in adj_list:
            adj_list[edge.source].append(edge.target)

    # 2. Find Start Node (User Query)
    start_node = None
    for node in workflow.nodes:
        if node.type == 'user_query':
            start_node = node
            break
    
    if not start_node:
        return ExecutionResponse(result="Error: No User Query node found.", logs=["Workflow validation failed."])

    # 3. Execution State
    # We'll use a queue for traversal.
    # context stores the output of each node to pass to the next.
    # For simplicity, we assume a single path or we propagate the "latest" output.
    
    queue = [(start_node.id, user_query)] # (node_id, input_data)
    visited = set() # To prevent cycles if any
    
    execution_logs = []
    final_output = ""
    
    # Simple Topological execution or BFS. 
    # Since we need values from previous nodes, we should process a node only when its dependencies are met.
    # But for this simple assignment, standard BFS with input passing works if we assume linear flow.
    # Improving: use in-degrees for topological sort.
    
    in_degree = {node.id: 0 for node in workflow.nodes}
    for edge in workflow.edges:
        in_degree[edge.target] += 1
        
    # Start with nodes having in-degree 0 (should be User Query)
    queue = [node.id for node in workflow.nodes if in_degree[node.id] == 0]
    
    # Store outputs
    node_outputs = {} # node_id -> output
    
    # For User Query node, we inject the user_query as "output" conceptually or handle it in logic.
    # Actually, the user_query IS the logic for User Query node.
    
    while queue:
        current_id = queue.pop(0)
        current_node = node_map[current_id]
        visited.add(current_id)
        
        # Determine Input for this node
        # It comes from parents.
        # If User Query, input is user_query arg.
        # Else, input is the gathered output of parents.
        
        node_input = ""
        if current_node.type == 'user_query':
            node_input = user_query
        else:
            # Find parents
            parents = [edge.source for edge in workflow.edges if edge.target == current_id]
            # Join their outputs.
            parent_outputs = [str(node_outputs.get(p, "")) for p in parents]
            node_input = "\n".join(parent_outputs)

        execution_logs.append(f"Executing Node: {current_node.data.label or current_node.type} ({current_id})")
        
        # Execute Logic
        output = ""
        try:
            if current_node.type == 'user_query':
                output = node_input # User query creates the initial string
            elif current_node.type == 'knowledge_base':
                # Retrieve context based on input query
                # Input is likely the user query.
                context = query_documents(node_input)
                output = context # Pass context forward
                execution_logs.append(f"Retrieved context length: {len(context)}")
            elif current_node.type == 'llm_engine':
                # Input could be user query OR context OR both.
                # If we have multiple parents, one might be query, one might be context.
                # Heuristic: The input string contains everything.
                # We can refine this: check parents' types.
                # But treating everything as text is the "LLM" way.
                # Optional: Config in NodeData could have "prompt".
                prompt = current_node.data.config.get("prompt", "")
                # If we have retrieval context, it's in node_input.
                # If we have the original query, it's also in node_input if passed down.
                # This is a bit tricky in linear flow: Query -> KB -> LLM.
                # KB output is Context. Query is lost?
                # Ideally KB should pass (Query, Context).
                # For this simple engine, let's assume LLM receives "Context" from KB.
                # AND we need the Query.
                # Option: KB outputs "Context: ... \n Query: ..."
                # OR we store global user_query.
                
                # Let's use the global user_query + input (which is context).
                context = node_input
                api_key = current_node.data.config.get("apiKey")
                response = await generate_response(prompt=user_query, context=context, api_key=api_key)
                output = response
            elif current_node.type == 'output':
                output = node_input
                final_output = output
        except Exception as e:
            execution_logs.append(f"Error in node {current_id}: {str(e)}")
            output = f"Error: {str(e)}"

        node_outputs[current_id] = output
        
        # Add neighbors to queue
        neighbors = adj_list[current_id]
        for neighbor in neighbors:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)
                
    return ExecutionResponse(result=final_output, logs=execution_logs)
