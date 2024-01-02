export async function consultCdrs(type, phone, dateStart, dateEnd){

    dateStart = await formatTime(dateStart);
    dateEnd = await formatTime(dateEnd);

    let url = 'https://apps-ws.spot1.mx/consultCdrs?' + new URLSearchParams({
        type,
        phone,
        dateStart,
        dateEnd,
    })
        // console.log(["url", url])

    try {
        // console.log(url)
        const response = await (await fetch(url)).json();
        // console.log(["fin", response])
        return response
    } catch (error) {
        // return console.log(error)
    }

}

function formatTime(date) {
    // console.log(date);
    let dateFormat = date.getYear();
    dateFormat -= 100
    dateFormat+="-"+(date.getMonth()+1);
    dateFormat+="-"+date.getDate();
    return dateFormat;
}
