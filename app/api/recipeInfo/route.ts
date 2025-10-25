import {NextResponse,NextRequest} from "next/server";
export async function POST(req:NextRequest){
    try{

        
        const {id} = await req.json();
        const apiKey = process.env.SPOON_API_KEY;
        const url = `https://api.spoonacular.com/recipes/${id}/information?includeNutrition=true&apiKey=${apiKey}`;
        
        const res = await fetch(url,{method:"GET"});
        if(!res.ok){
            const detail = await res.text();
            return NextResponse.json({
                error: `Spoonacular ${res.status}`,
            });
        }

        const data = await res.json()
        return NextResponse.json({
            ok:true,info:data});

    }catch(error:any){
        return NextResponse.json({error:error.message ?? "Server error"},{status:error.status});
    }
}
   