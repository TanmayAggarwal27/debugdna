import { CrashReport } from '../sdk/DebugDNASDK';

export type NodeType = 'Environment' | 'Event' | 'Error' | 'FunctionCall';

export interface GraphNode {
    id: string;
    type: NodeType;
    label: string;
    properties: Record<string, any>;
}

export interface GraphEdge {
    source: string;
    target: string;
    relation: 'CAUSED_BY' | 'FOLLOWED_BY' | 'EXECUTED_IN' | 'PART_OF';
}

export interface CausalGraph {
    nodes: GraphNode[];
    edges: GraphEdge[];
}

export class CausalGraphBuilder {
    /**
     * Translates a raw crash report into a structured causal graph.
     */
    public buildGraph(report: CrashReport): CausalGraph {
        const nodes: GraphNode[] = [];
        const edges: GraphEdge[] = [];

        // 1. Add Environment Node
        const envNodeId = 'env_1';
        nodes.push({
            id: envNodeId,
            type: 'Environment',
            label: 'User Environment',
            properties: report.environment
        });

        // 2. Add Event Nodes (Breadcrumbs)
        let previousEventId: string | null = null;
        report.breadcrumbs.forEach((bc, index) => {
            const eventId = `event_${index}`;
            nodes.push({
                id: eventId,
                type: 'Event',
                label: `[${bc.type}] ${bc.message}`,
                properties: { ...bc }
            });

            // Connect environment to event
            edges.push({ source: eventId, target: envNodeId, relation: 'EXECUTED_IN' });

            // Connect sequence of events
            if (previousEventId) {
                edges.push({ source: previousEventId, target: eventId, relation: 'FOLLOWED_BY' });
            }
            previousEventId = eventId;
        });

        // 3. Add Error Node
        const errorNodeId = 'error_1';
        nodes.push({
            id: errorNodeId,
            type: 'Error',
            label: report.message,
            properties: { stack: report.stack }
        });

        if (previousEventId) {
            edges.push({ source: previousEventId, target: errorNodeId, relation: 'CAUSED_BY' });
        }
        edges.push({ source: errorNodeId, target: envNodeId, relation: 'EXECUTED_IN' });

        // 4. Parse Stack Trace into nodes
        if (report.stack) {
            const stackLines = report.stack.split('\n').slice(1); // skip the message line itself
            let prevFrameId: string | null = errorNodeId;

            stackLines.forEach((line, index) => {
                const trimmedLine = line.trim();
                // Basic check for common stack trace line prefixes
                if (!trimmedLine.startsWith('at') && !trimmedLine.includes('@')) return;

                const frameId = `frame_${index}`;
                nodes.push({
                    id: frameId,
                    type: 'FunctionCall',
                    label: trimmedLine,
                    properties: {}
                });

                edges.push({ source: prevFrameId!, target: frameId, relation: 'PART_OF' });
                prevFrameId = frameId;
            });
        }

        return { nodes, edges };
    }
}
