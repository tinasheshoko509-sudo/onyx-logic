
export interface FlowNode {
  id: string;
  type: string;
  name: string;
  action: string;
  params: string;
}

export const convertToN8N = (nodes: FlowNode[]) => {
  const n8nNodes = nodes.map((node, index) => {
    let n8nType = 'n8n-nodes-base.noOp';
    let parameters = {};

    try {
      parameters = JSON.parse(node.params);
    } catch (e) {
      parameters = { config: node.params };
    }

    switch (node.type) {
      case 'trigger':
        n8nType = node.name.toLowerCase().includes('webhook') 
          ? 'n8n-nodes-base.webhook' 
          : 'n8n-nodes-base.cron';
        break;
      case 'ai':
        n8nType = 'n8n-nodes-base.aiAgent';
        break;
      case 'logic':
        if (node.name.toLowerCase().includes('http')) {
          n8nType = 'n8n-nodes-base.httpRequest';
        } else if (node.name.toLowerCase().includes('if') || node.name.toLowerCase().includes('condition')) {
          n8nType = 'n8n-nodes-base.if';
        }
        break;
      case 'communication':
        if (node.name.toLowerCase().includes('slack')) {
          n8nType = 'n8n-nodes-base.slack';
        } else if (node.name.toLowerCase().includes('mail')) {
          n8nType = 'n8n-nodes-base.emailSend';
        }
        break;
      default:
        n8nType = 'n8n-nodes-base.noOp';
    }

    return {
      parameters,
      id: node.id,
      name: node.name,
      type: n8nType,
      typeVersion: 1,
      position: [250, 100 + (index * 150)]
    };
  });

  const connections: any = {};
  for (let i = 0; i < n8nNodes.length - 1; i++) {
    const currentNode = n8nNodes[i];
    const nextNode = n8nNodes[i + 1];
    
    connections[currentNode.name] = {
      main: [
        [
          {
            node: nextNode.name,
            type: 'main',
            index: 0
          }
        ]
      ]
    };
  }

  return {
    nodes: n8nNodes,
    connections
  };
};

export const convertTopologyToN8N = (topology: any) => {
  // If topology is already in a nodes/connections format
  if (topology.nodes && Array.isArray(topology.nodes)) {
    const n8nNodes = topology.nodes.map((node: any, index: number) => {
      let n8nType = 'n8n-nodes-base.noOp';
      const type = node.type?.toLowerCase() || '';
      
      if (type.includes('webhook')) n8nType = 'n8n-nodes-base.webhook';
      else if (type.includes('httprequest') || type.includes('http')) n8nType = 'n8n-nodes-base.httpRequest';
      else if (type.includes('aiagent') || type.includes('ai')) n8nType = 'n8n-nodes-base.aiAgent';
      else if (type.includes('condition') || type.includes('if')) n8nType = 'n8n-nodes-base.if';
      else if (type.includes('slack')) n8nType = 'n8n-nodes-base.slack';
      else if (type.includes('email') || type.includes('mail')) n8nType = 'n8n-nodes-base.emailSend';
      else if (type.includes('cron') || type.includes('schedule')) n8nType = 'n8n-nodes-base.cron';
      else if (type.includes('code')) n8nType = 'n8n-nodes-base.code';
      else if (type.includes('set')) n8nType = 'n8n-nodes-base.set';
      else n8nType = `n8n-nodes-base.${node.type || 'noOp'}`;

      return {
        parameters: node.parameters || {},
        id: node.id || Math.random().toString(36).substr(2, 6),
        name: node.name || `Node ${index}`,
        type: n8nType,
        typeVersion: 1,
        position: node.position || [250, 100 + (index * 150)]
      };
    });

    const connections: any = {};
    if (topology.connections && Array.isArray(topology.connections)) {
      topology.connections.forEach((conn: any) => {
        const fromNode = n8nNodes.find(n => n.id === conn.from);
        const toNode = n8nNodes.find(n => n.id === conn.to);
        if (fromNode && toNode) {
          if (!connections[fromNode.name]) {
            connections[fromNode.name] = { main: [] };
          }
          
          // Handle branching (e.g., If nodes in n8n have 2 outputs: 0=true, 1=false)
          const branchIndex = (conn.branch === 'false' || conn.branch === 1 || conn.branch === '1') ? 1 : 0;
          
          if (!connections[fromNode.name].main[branchIndex]) {
            connections[fromNode.name].main[branchIndex] = [];
          }
          
          connections[fromNode.name].main[branchIndex].push({
            node: toNode.name,
            type: 'main',
            index: 0
          });
        }
      });
    } else {
        // Fallback to linear connections if none provided
        for (let i = 0; i < n8nNodes.length - 1; i++) {
            const currentNode = n8nNodes[i];
            const nextNode = n8nNodes[i + 1];
            connections[currentNode.name] = {
                main: [[{ node: nextNode.name, type: 'main', index: 0 }]]
            };
        }
    }

    return {
      nodes: n8nNodes,
      connections
    };
  }
  return topology;
};
