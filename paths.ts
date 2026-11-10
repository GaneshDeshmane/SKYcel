import { Glob } from "bun";
export function Getpath(folderPath : string):string[]{
    const responnse :string[]= []
    const glob = new Glob("**/*")
    for(const files of glob.scanSync({cwd:folderPath,onlyFiles:true})){
        responnse.push(files)
    }
    return responnse
}