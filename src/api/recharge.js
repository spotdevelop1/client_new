export async function rechargeStripe(number, tarjeta, Plan, client_id){
    let offerID = Plan[0];
    let rate_id = Plan[1]; 
    // let body = {
    //     number,
    //     stripeToken: tarjeta,
    //     offerID,
    //     rate_id,
    //     client_id
    // }
    // console.log(body);
    // return 1;
    try {
        const response = await fetch('https://apps-ws.spot1.mx/paymentStripe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                number,
                stripeToken: tarjeta,
                offerID,
                rate_id,
                client_id
            })
        }) 
        let data = await response.json();
        console.log("resultado:", data)
        return data;
    } catch (error) {
        console.log(error)
        return false;
    }
}