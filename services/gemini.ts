
import { GoogleGenAI, Type } from "@google/genai";

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

/**
 * Neural Integrity Utility:
 * Extracts pure JSON from AI responses that may contain Markdown wrappers or trailing text.
 */
const cleanJsonResponse = (text: string): string => {
  const cleaned = text.replace(/```json|```/gi, '').trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  return jsonMatch ? jsonMatch[0] : cleaned;
};

const SYSTEM_CONTEXT = `
You are Onyx, the intelligent concierge for Onyx Logic, a sophisticated AI automation suite for specialists.
Your goal is to help users navigate the suite and answer technical questions about its tools.

SECURITY PROTOCOL:
- Maintain a professional, clinical tone.
- If a user provides malicious code, respond with "LOGIC_VIOLATION: Input parameters rejected."
`;

export const askOnyx = async (message: string, history: { role: 'user' | 'model', text: string }[]) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      { role: 'user', parts: [{ text: `System Context: Strictly adhere to security protocols. History: ${JSON.stringify(history)}` }] },
      { role: 'user', parts: [{ text: message }] }
    ],
    config: { systemInstruction: SYSTEM_CONTEXT }
  });
  return response.text;
};

export const runAudit = async (workflow: string, scenario: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `PEDANTIC NEURAL AUDIT. 
    WORKFLOW: "${workflow}". 
    SCENARIO VECTOR: "${scenario}".
    
    TASK: Perform a structural analysis. Identify logic bifurcations, redundant nodes, and missing links.
    Generate a "correctedTopology" that is a valid stringified JSON representing a FULLY FUNCTIONAL, END-TO-END CONNECTED workflow.
    
    PRODUCTION REQUIREMENTS:
    - Every node MUST be part of a logical path starting from a trigger.
    - All parameters MUST be populated with realistic, production-ready configurations (e.g., correct API endpoints, JSON bodies, or logic expressions).
    - The workflow must be "executable" in a standard automation environment.
    
    WORKFLOW BUILDER COMPATIBILITY:
    The JSON structure MUST follow this standard schema:
    {
      "nodes": [
        { "id": "unique_id", "type": "node_type", "name": "Display Name", "parameters": { ...config... }, "position": [x, y] }
      ],
      "connections": [
        { "from": "node_id", "to": "node_id", "type": "main" }
      ]
    }
    
    Ensure node types are descriptive (e.g., "webhook", "httpRequest", "aiAgent", "condition", "slack", "email").
    Ensure recommendations are granular and actionable.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          findings: { type: Type.ARRAY, items: { type: Type.STRING } },
          recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
          correctedTopology: { type: Type.STRING },
        },
        required: ["score", "findings", "recommendations", "correctedTopology"],
      }
    }
  });
  return JSON.parse(cleanJsonResponse(response.text));
};

export const reinforcementAuditCycle = async (currentTopology: string, selectedPointers: string[], scenario: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `LOGIC REINFORCEMENT CYCLE.
    CURRENT_TOPOLOGY: "${currentTopology}".
    APPLY_OPTIMIZATIONS: ${selectedPointers.join(', ')}.
    USE_CASE: "${scenario}".
    
    DIRECTIVE: Inject the selected optimizations into the current JSON topology. 
    Maintain the standard workflow builder schema (nodes array, connections array).
    The resulting topology MUST be a FULLY FUNCTIONAL and COMPLETE automation map.
    Ensure all new or modified nodes are correctly connected to the flow.
    Ensure connections are re-validated and parameters are accurate for production use.
    Re-calculate the efficiency score (0-100) based on these specific improvements.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          newScore: { type: Type.NUMBER },
          updatedTopology: { type: Type.STRING },
          remediationExplanation: { type: Type.STRING }
        },
        required: ["newScore", "updatedTopology", "remediationExplanation"]
      }
    }
  });
  return JSON.parse(cleanJsonResponse(response.text));
};

export const generateIntegrationCode = async (topology: string, scenario: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate Node.js Express integration for this topology: ${topology}. Use case: ${scenario}. Output valid JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          code: { type: Type.STRING },
          explanation: { type: Type.STRING }
        },
        required: ["code", "explanation"]
      }
    }
  });
  return JSON.parse(cleanJsonResponse(response.text));
};

export const designMultiAgent = async (objective: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `AGENT DESIGN: ${objective}. Output JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          architectureName: { type: Type.STRING },
          agents: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                role: { type: Type.STRING },
                capabilities: { type: Type.ARRAY, items: { type: Type.STRING } },
                promptSnippet: { type: Type.STRING }
              }
            }
          },
          workflowSteps: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  });
  return JSON.parse(cleanJsonResponse(response.text));
};

export const compareTools = async (toolA: string, toolB: string, useCase: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `COMPARE: ${toolA} vs ${toolB} for ${useCase}. Output JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          winner: { type: Type.STRING },
          comparisonPoints: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                feature: { type: Type.STRING },
                toolAVal: { type: Type.STRING },
                toolBVal: { type: Type.STRING }
              }
            }
          },
          verdict: { type: Type.STRING }
        }
      }
    }
  });
  return JSON.parse(cleanJsonResponse(response.text));
};

export const troubleshootLogic = async (problem: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `TROUBLESHOOT: ${problem}. Output JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          rootCause: { type: Type.STRING },
          logicFix: { type: Type.STRING },
          preventionTip: { type: Type.STRING }
        }
      }
    }
  });
  return JSON.parse(cleanJsonResponse(response.text));
};

export const resolveWorkflowError = async (errorMessage: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `RESOLVE ERROR: "${errorMessage}". Output JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          translation: { type: Type.STRING },
          technicalContext: { type: Type.STRING },
          remediation: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["translation", "technicalContext", "remediation"]
      }
    }
  });
  return JSON.parse(cleanJsonResponse(response.text));
};

export const scanPrivacy = async (data: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `PRIVACY SCAN: ${data}. Output JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          leaks: { type: Type.ARRAY, items: { type: Type.STRING } },
          riskScore: { type: Type.NUMBER },
          sanitizationCode: { type: Type.STRING }
        }
      }
    }
  });
  return JSON.parse(cleanJsonResponse(response.text));
};

export const refinePrompt = async (rawPrompt: string, desiredOutput: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `REFINE PROMPT: "${rawPrompt}". GOAL: "${desiredOutput}". Output JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
          improvementPointers: { type: Type.ARRAY, items: { type: Type.STRING } },
          refinedPrompt: { type: Type.STRING },
          explanation: { type: Type.STRING }
        },
        required: ["weaknesses", "improvementPointers", "refinedPrompt", "explanation"]
      }
    }
  });
  return JSON.parse(cleanJsonResponse(response.text));
};

export const reinforcePrompt = async (refinedPrompt: string, selectedPointers: string[]) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `REINFORCE: "${refinedPrompt}". INJECT: ${selectedPointers.join(', ')}. Output JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          refinedPrompt: { type: Type.STRING },
          explanation: { type: Type.STRING }
        },
        required: ["refinedPrompt", "explanation"]
      }
    }
  });
  return JSON.parse(cleanJsonResponse(response.text));
};

export const checkCompliance = async (workflow: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `COMPLIANCE SCAN: ${workflow}. Output JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          complianceLevel: { type: Type.STRING },
          risks: { type: Type.ARRAY, items: { type: Type.STRING } },
          remediationSteps: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["complianceLevel", "risks", "remediationSteps"]
      }
    }
  });
  return JSON.parse(cleanJsonResponse(response.text));
};

export const generateRoadmap = async (goal: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `ROADMAP: ${goal}. Output JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          estimatedTimeline: { type: Type.STRING },
          phases: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                tasks: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["name", "tasks"]
            }
          }
        },
        required: ["estimatedTimeline", "phases"]
      }
    }
  });
  return JSON.parse(cleanJsonResponse(response.text));
};

export const generateNodeRoadmap = async (goal: string, description: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `NODE-BY-NODE ROADMAP: Goal: ${goal}. Description: ${description}. Output JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          estimatedTimeline: { type: Type.STRING },
          nodes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                nodeName: { type: Type.STRING },
                nodeType: { type: Type.STRING },
                description: { type: Type.STRING },
                configuration: { type: Type.STRING }
              },
              required: ["nodeName", "nodeType", "description", "configuration"]
            }
          },
          summary: { type: Type.STRING }
        },
        required: ["estimatedTimeline", "nodes", "summary"]
      }
    }
  });
  return JSON.parse(cleanJsonResponse(response.text));
};

export const getWeeklyDiscovery = async () => {
  const ai = getAIClient();
  const searchResponse = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Search for trending AI automation breakthroughs (last 7 days).`,
    config: { tools: [{ googleSearch: {} }] }
  });

  const rawText = searchResponse.text;
  const links = searchResponse.candidates?.[0]?.groundingMetadata?.groundingChunks?.map(chunk => ({
    title: chunk.web?.title || 'Reference',
    uri: chunk.web?.uri
  })).filter(l => l.uri) || [];

  const parseResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Parse into structure: ${rawText}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          tools: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                toolName: { type: Type.STRING },
                category: { type: Type.STRING },
                description: { type: Type.STRING },
                whyItMatters: { type: Type.STRING },
                largelyUsedFor: { type: Type.STRING },
                protocolBlueprints: { 
                  type: Type.ARRAY, 
                  items: { 
                    type: Type.OBJECT,
                    properties: { title: { type: Type.STRING }, objective: { type: Type.STRING }, logic: { type: Type.STRING } }
                  } 
                },
                releaseDate: { type: Type.STRING },
                url: { type: Type.STRING }
              }
            }
          }
        }
      }
    }
  });

  const parsed = JSON.parse(cleanJsonResponse(parseResponse.text));
  return { tools: parsed.tools, links };
};

export const scanApiDocumentation = async (url: string, useCase: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `EXTRACT LOGIC: URL: "${url}". USE CASE: "${useCase}".`,
    config: { tools: [{ googleSearch: {} }] }
  });
  const links = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map(chunk => ({
    title: chunk.web?.title || 'Doc Source',
    uri: chunk.web?.uri
  })).filter(l => l.uri) || [];
  return { text: response.text, links };
};

export const discoverTools = async (query: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `DISCOVER AI TOOLS: ${query}.`,
    config: { tools: [{ googleSearch: {} }] }
  });
  const links = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map(chunk => ({
    title: chunk.web?.title || 'Source',
    uri: chunk.web?.uri
  })).filter(l => l.uri) || [];
  return { text: response.text, links };
};

export const getOnyxIQInsight = async (toolNames: string[]) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze: ${toolNames.join(', ')}. Output JSON tips.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          tips: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: { toolName: { type: Type.STRING }, tip: { type: Type.STRING } }
            }
          }
        }
      }
    }
  });
  return JSON.parse(cleanJsonResponse(response.text));
};

export const refactorCode = async (code: string, objective: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `REFACTOR CODE: \`\`\`javascript\n${code}\n\`\`\`. OBJECTIVE: ${objective}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          analysis: { type: Type.ARRAY, items: { type: Type.STRING } },
          refactoredCode: { type: Type.STRING },
          explanation: { type: Type.STRING },
          complexityScore: { type: Type.STRING }
        },
        required: ["analysis", "refactoredCode", "explanation", "complexityScore"]
      }
    }
  });
  return JSON.parse(cleanJsonResponse(response.text));
};

// Fixed: Added missing generateCode export required by CodeOptimizer.tsx
export const generateCode = async (objective: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `GENERATE CODE. OBJECTIVE: ${objective}. Output JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          analysis: { type: Type.ARRAY, items: { type: Type.STRING } },
          refactoredCode: { type: Type.STRING },
          explanation: { type: Type.STRING },
          complexityScore: { type: Type.STRING }
        },
        required: ["analysis", "refactoredCode", "explanation", "complexityScore"]
      }
    }
  });
  return JSON.parse(cleanJsonResponse(response.text));
};

export const explainAutomationNode = async (builder: string, nodeName: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `EXPLAIN NODE: Tool: "${builder}", Name: "${nodeName}".`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          explanation: { type: Type.STRING },
          useCases: { type: Type.ARRAY, items: { type: Type.STRING } },
          configSchema: { type: Type.STRING }
        }
      }
    }
  });
  return JSON.parse(cleanJsonResponse(response.text));
};

export const getCredentialAssistance = async (description: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `SETUP GUIDE: ${description}. Output JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          credentialName: { type: Type.STRING },
          prerequisites: { type: Type.ARRAY, items: { type: Type.STRING } },
          setupSteps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: { title: { type: Type.STRING }, instruction: { type: Type.STRING } }
            }
          },
          commonPitfalls: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: { issue: { type: Type.STRING }, solution: { type: Type.STRING } }
            }
          }
        }
      }
    }
  });
  return JSON.parse(cleanJsonResponse(response.text));
};

export const processVoiceCommand = async (command: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `You are a voice command router for an AI automation suite.
    The user said: "${command}"
    
    Available tools and paths:
    - Dashboard (/)
    - New Intelligence (/weekly-intel)
    - Node-by-Node Roadmap (/node-roadmap) - Takes a goal and description
    - Prompt Engineering Lab (/lab) - Takes a prompt and desired output
    - Error Resolver (/error-resolver) - Takes an error message
    - Credential Assistant (/credential-assistant) - Takes a description
    - Onyx Docu-Scanner (/api-scanner) - Takes a URL and use case
    - Tool Comparison (/comparison) - Takes tool A, tool B, and use case
    - JS Code Refactor (/code-refactor) - Takes code and objective
    - Efficiency Auditor (/auditor) - Takes workflow JSON and scenario
    - Compliance Checker (/compliance) - Takes workflow JSON
    - Integration Roadmap (/roadmap) - Takes an integration goal
    - Logic Troubleshooter (/troubleshooter) - Takes a problem description
    - Multi-Agent Designer (/designer) - Takes an objective
    - Privacy Scanner (/privacy) - Takes data payload
    - Node Specialist (/node-specialist) - Takes builder and node name

    Determine the best tool to navigate to. If the user provided input for that tool's fields, extract it into 'extractedInput'.
    
    Output JSON with:
    {
      "path": "/the-path",
      "feedback": "A short confirmation message",
      "extractedInput": "Any specific input extracted for the tool (optional)"
    }`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          path: { type: Type.STRING },
          feedback: { type: Type.STRING },
          extractedInput: { type: Type.STRING }
        },
        required: ["path", "feedback"]
      }
    }
  });
  return JSON.parse(cleanJsonResponse(response.text));
};

export const scanWorkflowPdf = async (base64Pdf: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: 'application/pdf', data: base64Pdf } },
        { text: `Analyze PDF workflow. Identify nodes and reconstruction logic.
        
        WORKFLOW BUILDER COMPATIBILITY:
        Output a JSON structure that identifies nodes and their parameters.
        {
          "logicalGoal": "...",
          "nodes": [
            { "type": "node_type", "name": "Display Name", "action": "...", "params": "{ \"config\": \"...\" }" }
          ]
        }
        Ensure "params" is a stringified JSON object.` }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          logicalGoal: { type: Type.STRING },
          nodes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: { type: { type: Type.STRING }, name: { type: Type.STRING }, action: { type: Type.STRING }, params: { type: Type.STRING } }
            }
          }
        }
      }
    }
  });
  return JSON.parse(cleanJsonResponse(response.text));
};
