import { cn } from "@/lib/utils";

export default function Skelton ({className}:{className:string}){
    return<div className={cn("animate pulse roudeded-xl bg-border/40",className)}></div>
}