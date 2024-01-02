import React, { useState, useEffect } from 'react'
import { TextInput, StyleSheet, View ,Text, Alert, Linking} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'
import {Picker} from '@react-native-picker/picker';
import { globalStyle } from '../styles/'
import { Loading } from '../components/Loading';
import { getAllRates, verifyRates } from "../api/rates";
import { rechargeStripe } from "../api/recharge";
import { STRIPE_PUBLIC_KEY} from "../../env.js"
const stripe = require("stripe-client")(STRIPE_PUBLIC_KEY)


export function PayRecharge ({closeModal, number, userId}){
    const [selectedValue, setSelectedValue] = useState(["Planes Disponibles"]);
    const [loader, setLoader] = useState([]);
    const [button, setButton] = useState(false);
    const [rates, setRates] = useState([{}]);
    const [offerts, setOfferts] = useState([]);
    // const [rateId, setRateId] = useState('');
    // const [offerID, setOfferID] = useState('');
    // const [numberRecharge, setNumberRecharge] = useState(number);
    const [name, setName] = useState("");
    const [card, setCard] = useState("");
    const [month, setMonth] = useState("");
    const [year, setYear] = useState("");
    const [cvc, setCvc] = useState("");
    
    // var offerts = [];
    var information = {};
    var tarjeta = {};

    useEffect( () => {
        searchOffer();
    }, [])

    const searchOffer = async () => {
        let offerts = [];
        let offert = await getAllRates();
        offert = offert['offers']

        const rates_limit = await verifyRates(number);
        await setRates(offert);
        
        // console.log(rates);

        offerts.push(<Picker.Item label={`Planes Disponibles`} value={0} />)
        if (offert != undefined) {
            for (let i = 0; i < rates_limit.length; i++) {
                for (let index = 0; index < offert.length; index++) {
                    if (rates_limit[i]['rate_id'] == offert[index].rate_id ) {
                        // console.log(offert[index]);
                        offert = offert.filter(elem => elem != offert[index]);
                    }
                }
            }  

            for (let index = 0; index < offert.length; index++) {
                offerts.push(
                    <Picker.Item label={`${offert[index].name } $${offert[index].price_sale }.00`} value={offert[index].rate_id} />
                )
            }
        }

        setOfferts(offerts)
    }

    const filterOffert = (offers) =>{
        if (offers != undefined) {
            for (let index = 0; index < offers.length; index++) {
                if (offers[index].rate_id == selectedValue) {
                    return offers[index].offerID;
                }
            }
        }
    }

    const createPay = async () => {
        setButton(true);
        information = {
            card: {
              number: card,
              exp_month: month,
              exp_year: year,
              cvc: cvc,
              name: name
            }
        }

        tarjeta = await stripe.createToken(information);

        Alert.alert('Info', 'Desea realizar su compra?', [
            { text: 'Cancelar', style: 'cancel',},
            { text: 'Comprar', onPress: () => sellRate(tarjeta)},
        ]);
        
        setButton(false);
    }

    const sellRate = async (tarjeta) =>{
        setLoader(<Loading/>)
        const offerID = await filterOffert(rates)
        console.log(number, tarjeta.id, offerID, selectedValue, userId);
        if(tarjeta?.error){
            setLoader()
            Alert.alert('Error!!', 'Los datos no correponde a ninguna tarjeta valida, verifique sus datos.');       
        }else{
            const response = await rechargeStripe(number, tarjeta.id, [offerID, selectedValue], userId);
            setLoader()
            console.log( response.ticket);
            Alert.alert('Info', response.message, [
                {
                  text: 'Abrir ticket',
                  onPress: () =>  Linking.openURL(response.ticket),
                },
                {text: 'Aceptar', onPress: () => console.log('OK Pressed')},
              ]);
            setButton(false);
        }
    }

    return (
        <View style={styles.modalPaymentRecharge}>
            <View style={styles.ContentBanner}>
                <Text style={styles.textBanner}>Planes Disponibles</Text>
            </View>
            <View style={styles.containerPayment}>
                <View style={styles.container}>
                    <Picker
                        style={[styles.text, styles.select]}
                        selectedValue={selectedValue}
                        onValueChange={(itemValue) => setSelectedValue(itemValue)}>
                        {offerts}
                    </Picker>
                </View>
            </View>
            <Text style={styles.textCenter}>Datos de la tarjeta</Text>
            <View style={styles.containerCreditCard}>
                <TextInput maxLength={16} style={[styles.input, styles.bordersInputs]} placeholderTextColor="#000" keyboardType='default'
                             placeholder='Nombre del propietario' value={name} onChangeText={setName}/>
            </View>

            <View style={styles.containerCreditCard}>
                <TextInput maxLength={16} style={[styles.input, styles.bordersInputs]} placeholderTextColor="#000" keyboardType='default'
                             placeholder='0000-0000-0000-0000' value={card} onChangeText={setCard}/>
            </View>
            <View  style={styles.containerCreditCard}>
                <TextInput maxLength={2} style={[styles.input, styles.bordersInputs]} placeholderTextColor="#000" keyboardType='default'
                            placeholder='mes'  value={month} onChangeText={setMonth}/>
                <TextInput maxLength={2} style={[styles.input, styles.bordersInputs]} placeholderTextColor="#000" keyboardType='default'
                            placeholder='año'  value={year} onChangeText={setYear}/>
                <TextInput maxLength={3} style={[styles.input, styles.bordersInputs]} placeholderTextColor="#000" keyboardType='default'
                            placeholder='cvc'  value={cvc} onChangeText={setCvc}/>
            </View>
            <View style={styles.btns}>
                <Icon.Button style={[styles.btnsPay, styles.btnsPayDanger]} name='arrow-back-outline' onPress={() => closeModal()}>Regresar</Icon.Button>
                <Icon.Button disabled={button} style={[styles.btnsPay, styles.btnsPayPrimary]} name='cart-outline' onPress={() => createPay()}>Recargar</Icon.Button>
            </View>   
            {loader}
        </View>
    );
}

const styles = StyleSheet.create({
    containerCreditCard:{
        marginHorizontal: 40,
        marginVertical:20,
        marginTop:0,
        flexDirection:'row',
        justifyContent:'center',

    },
    input:{
        padding: 10,
        paddingHorizontal:30,
        color: '#000',
        marginTop: 10,
        fontSize: 16
    },
    textCenter:{
        fontSize:20,
        fontWeight:'bold',
        textAlign:'center',

    },
    ContentBanner:{
        backgroundColor:'#2f3541',
        height:80,
        justifyContent:'center',
        paddingHorizontal:20,
        position:'relative',
        marginTop:60
    },
    textBanner:{
        color:'white',
        fontSize:22,
        textAlign:'center',
        fontWeight:'bold',
    },
    containerPayment:{
        marginHorizontal: 40,
        marginVertical:10,
    },
    container:{
        marginVertical:10,
        borderColor: '#7b6cc8',
        borderWidth: 3,
        borderRadius: 20,        
    },
    text:{
        color: 'black'
    },
    modalPaymentRecharge:{
        flex: 1,
        alignContent:'center',
        backgroundColor:'white'
    },
    btns:{
        ...globalStyle.btnsModal,
        justifyContent:'space-around'
    },
    btnsPay:{
        width:150,
        justifyContent:'center'
    },
    btnsPayDanger:{
        backgroundColor:'red',
    },
    btnsPayPrimary:{
        backgroundColor:'blue'
    },
    select:{
        borderColor: '#7b6cc8',
        borderWidth: 1,
        color:'#506a7b',
    },
    bordersInputs:{
        borderColor: '#7b6cc8',
        borderWidth: 2,
        color:'#506a7b',
        margin: 3,
        borderRadius: 7
    }
})