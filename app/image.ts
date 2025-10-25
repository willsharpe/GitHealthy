import {GoogleGenAI} from "@google/genai";


const ai = new GoogleGenAI({apiKey:process.env.NEXT_PUBILC_GEMINI_API_KEY});


async function analyzeIngredients(base64: string,mimeType:string){
    try{
        const contents = [
        {
            inlineData:{
                mimeType:mimeType,
                data:base64,
            },
        },
        { text: "Identify all of the ingredients in this image and return them as a JSON array with ingredient name and confidence score."},
    ];
    const result = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents:contents,
    });

    return result.candidates?.[0]?.content?.parts?.[0]?.text || "";

    }catch(error){
        console.error("Gemini Vision Error:",error);
        throw new Error("Failed to analyze image.");
    }
    
}


export default analyzeIngredients;