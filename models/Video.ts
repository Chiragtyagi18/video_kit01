import bcrypt from "bcryptjs";
import mongoose, { Schema, model,models} from "mongoose";
import { IUser } from "./User";
export const video_dimension ={
    width: 1280,
    height: 720,
} as const;

export interface IVideo {
    _id?: mongoose.Types.ObjectId;
  name: string;
  title: string;
  description: string;
    videoUrl: string;
    thumbnailUrl: string;    
    videoFileId?: string;
    thumbnailFileId?: string;
    controls?:boolean;
    trasnformation?:{
        height:number;
        widhth:number;
        quality?:number;
    }
    createdAt?: Date;
    updatedAt?: Date;
}
const videoSchema=new Schema<IVideo>({
    title:{type:String,required:true},
    description:{type:String,required:true},
    videoUrl:{type:String,required:true},
    thumbnailUrl:{type:String,required:true},
    videoFileId:{type:String},
    thumbnailFileId:{type:String},
    controls:{type:Boolean,default:true},
    trasnformation:{
        height:{type:Number,default:video_dimension.height},
        widhth:{type:Number,default:video_dimension.width},
    }
}, {timestamps:true}
)

const Video=models?.Video || model<IVideo>("Video",videoSchema);
export default Video;
