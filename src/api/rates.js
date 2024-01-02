export async function getAllRates(){
    try {
        const response = await fetch('https://apps-ws.spot1.mx/getAllRates', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }) 
        return response.json()
    } catch (error) {
        console.log(error)
        return error;
    }
}

export async function verifyRates(number){
    try {
        const response = await fetch('https://apps-ws.spot1.mx/verifyRechage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                number,
            })
        }) 
        let data = await response.json();
        // console.log(data)
        return data;
    } catch (error) {
        console.log(error)
        return false;
    }
}

