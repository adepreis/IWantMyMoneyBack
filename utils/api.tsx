export const Routes = {
    NOTE: async (id: string) => {
        const request = await fetch(`/api/${id}`);

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