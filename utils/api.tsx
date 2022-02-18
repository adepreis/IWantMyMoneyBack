import { TempLigneDeFrais } from "../components/EditLineForm";
import { IMission } from "../entity/mission.entity";
import { INoteDeFrais } from "../entity/notedefrais.entity";
import { UILigne, UINote } from "../pages/home/[params]";

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
        edit: async (id: string) => {
            const request = await fetch(`/api/`, {
                method: "PUT",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({id})
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
                console.log(result);
                return result;
            } 
            else {
                // Error while fetching
                console.log(await request.json()); 
                return null;
            }
        }
    },
    LINE: {
        create: async (line: UILigne, note: INoteDeFrais) => {
            if (line.UI !== "post") {
                throw new Error(`Attempted to create a ${line.id} line, but current line need to be ${line.UI}`);
            }

            if (!(line as TempLigneDeFrais)?.files) {
                throw new Error(`Attempted to create a ${line.id} line, but current line is already stored in db.`);
            }

            delete (line as Partial<UILigne>).UI;
            const tempLine: TempLigneDeFrais = line as TempLigneDeFrais; 
            const files = tempLine.files;

            const body = {
                titre: tempLine.titre,
                date: tempLine.date,
                prixHT: tempLine.prixHT,
                prixTTC: tempLine.prixTTC,
                prixTVA: tempLine.prixTVA,
                type: tempLine.type,
                justificatif: files?.[0],
                avance: tempLine.avance,
                commentaire: tempLine.commentaire,
                perdu: tempLine.perdu, 
                note: note.id,
                mission: tempLine.mission.id
            }

            const formData  = new FormData();
            for(const name in body) {
                formData.append(name, (body as any)?.[name]);
            }

            const request = await fetch(`/api/ligne`, {
                method: 'POST',
                body: formData
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
        edit: async (line: UILigne, note: INoteDeFrais) => {
            if (line.UI !== "put") {
                throw new Error(`Attempted to edit a ${line.id} line, but current line need to be ${line.UI}`);
            }

            var file: File | null = null;
            if (!(line as TempLigneDeFrais)?.files || (line as TempLigneDeFrais).files.length === 0) {
                const {justificatif} = line;
                if (justificatif !== "") {
                    // We need to fetch current file
                    const fileReq = await fetch(justificatif.includes("http") ? justificatif : `/justificatif/${justificatif}`);
                    if (fileReq.status === 200) {
                        const blob = await fileReq.blob();
                        file = new File([blob], justificatif);
                    }
                }
            } else {
                file = (line as TempLigneDeFrais)?.files?.[0];
            }

            delete (line as Partial<UILigne>).UI;
            const tempLine: TempLigneDeFrais = line as TempLigneDeFrais; 

            const body = {
                id: tempLine.id,
                titre: tempLine.titre,
                date: tempLine.date,
                prixHT: tempLine.prixHT,
                prixTTC: tempLine.prixTTC,
                prixTVA: tempLine.prixTVA,
                type: tempLine.type,
                justificatif: file,
                avance: tempLine.avance,
                commentaire: tempLine.commentaire,
                perdu: tempLine.perdu, 
                note: note.id,
                mission: tempLine.mission.id
            }

            const formData  = new FormData();
            for(const name in body) {
                formData.append(name, (body as any)?.[name]);
            }

            const request = await fetch(`/api/ligne`, {
                method: 'PUT',
                body: formData
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
            const request = await fetch(`/api/ligne/${id}`, {
                method: "DELETE"
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
    VALIDATEUR: {
        get: async () => {
            const request = await fetch(`/api/validateur/home`);
    
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