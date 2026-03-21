import { IVideo } from "@/models/Video";
export type VideoFormData= Omit<IVideo,"id">;

type FetchOptions = {
    method?: "GET" |"POST"| "PUT" |"DELETE";
    body?: any;
    headers?: Record<string, string>;
}
class ApiClient {
    private async fetch<T>(
        endpoint:string,
        options:FetchOptions={}
    ):Promise<T> {
        const {method="GET",body,headers={}}=options;
        const defaultHeaders={
            "Content-Type":"application/json",
            ...headers
        };
        const res=await fetch(`/api/${endpoint}`,{
            method,
            body:body? JSON.stringify(body):undefined,
            headers:defaultHeaders
        })
        if(!res.ok){
            throw new Error(await res.text());
            
        }
        return res.json();
        
    }
    async getVideo(){
            return this.fetch("/video");
        }
    async createVideo(videoData:VideoFormData){
        return this.fetch("/video",{
            method:"POST",
            body:videoData
        })
    }
}

export const apiClient=new ApiClient();