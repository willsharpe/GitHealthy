import {GoogleGenAI} from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY});


export async function POST(req:NextRequest){
    try{
        const {base64,mimeType} = await req.json();
        const contents = [
            {
                inlineData: {
                    mimeType:mimeType,
                    data:base64,
                },
            },
            {text:"List all visible ingredients and food or drink items as JSON with name and confidence score. I want you to return JSON like this: name:Tomato,confidence:100"},
        ];

        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents:contents,
        });
    console.log(result.candidates?.[0]?.content?.parts?.[0].text);
    const text = result.candidates?.[0]?.content?.parts?.[0].text;

    return NextResponse.json({ok:true,text});

    }catch(e:any){
        console.error("Gemini Vision Error:",e);
        return NextResponse.json({ error: "Failed to analyze" }, { status: 500 });
    }
    
}


