export const Routes = {
    NOTE: {
        get: async (id: string) => {
            const request = await fetch(`/api/${id}`);
    
            if (request.status === 200) {
                const result = await request.json();
                return result;
            } 
            else {
                // Error while fetching
                return null;
            }
        },
        create: async (body: {mois: number, annee: number}) => {
            const request = await fetch(`/api`, {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });
    
            if (request.status === 200) {
                const result = await request.json();
                return result;
            } 
            else {
                // Error while fetching
                return null;
            }
        },
        delete: async (id: string) => {
            const request = await fetch(`/api/${id}`, {
                method: "DELETE",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
            });
    
            if (request.status === 200) {
                const result = await request.json();
                return result;
            } 
            else {
                // Error while fetching
                return null;
            }
        }
    },
    MISSION: {
        get: async (timestamp: number) => {
            const request = await fetch(`/api/ligne/mission/${timestamp}`);
    
            if (request.status === 200) {
                const result = await request.json();
                return result;
            } 
            else {
                // Error while fetching
                return null;
            }
        }
    }
}