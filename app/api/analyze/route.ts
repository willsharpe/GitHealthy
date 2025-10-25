import {GoogleGenAI} from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({apiKey:process.env.NEXT_PUBILC_GEMINI_API_KEY});


export async function POST(req:NextRequest){
    try{
        const {base64,mimeType} = await req.json();
       
  
   
    
    const result = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents:{
                inlineData: {
                    mimeType:mimeType,
                    data:base64
                },
            },
    });

    return NextResponse.json( result.candidates?.[0]?.content?.parts?.[0]?.text || "");

    }catch(error){
        console.error("Gemini Vision Error:",error);
        return NextResponse.json({ error: "Failed to analyze" }, { status: 500 });
    }
    
}


