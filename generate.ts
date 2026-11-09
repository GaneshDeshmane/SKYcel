const Ma_ength =5

export function generate(){
    let ans = ""
    let opt = "1234567890qwertyuiopasdfghjklzxcvbnm"
    for (let i = 0; i < Ma_ength; i++) {
        ans+=opt[Math.floor(Math.random()*opt.length)]
    }
    return ans
}