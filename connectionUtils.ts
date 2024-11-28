import { Device } from "react-native-ble-plx";
import RNFetchBlob from "rn-fetch-blob";

export const getData = (
    othis : Device | null,
    setGx : (gX : string) => void,
    setGy : (gY : string) => void,
    setGz : (gz : string) => void,
    updateP1 : (p1Value : string) => void,
    updateP2 : (p2Values : string[]) => void,
) => {
    if (othis && othis.manufacturerData) {

      console.log('cerco i dati________________________ ');
      // Decodifica la stringa Base64 in un array di byte
      const advertisingBinary = RNFetchBlob.base64.decode(othis.manufacturerData);

      // Converte la stringa binaria in un array di byte (Uint8Array)
      const advertisingByteArray = new Uint8Array(advertisingBinary.length);

      // Popola l'array di byte
      for (let i = 0; i < advertisingBinary.length; i++) {
        advertisingByteArray[i] = advertisingBinary.charCodeAt(i);
      }

      // Ora trasformiamo l'array di byte in una stringa esadecimale
      let hexString = '';
      advertisingByteArray.forEach(byte => {
        // Converte ogni byte in esadecimale e lo aggiunge alla stringa
        hexString += byte.toString(16).padStart(2, '0').toUpperCase();
      });

      hexString = hexString.replace(/([0-9A-F]{2})/g, ' $1').toUpperCase();
      console.log("Manufacturer data as hex string:", hexString);

      transformData(hexString, setGx, setGy, setGz, updateP1, updateP2);
    } else {
      console.log("No device or manufacturer data available.");
    }
  }

const transformData = (
    data : string,
    setGx : (gX : string) => void,
    setGy : (gY : string) => void,
    setGz : (gz : string) => void,
    updateP1 : (p1Value : string) => void,
    updateP2 : (p2Values : string[]) => void,
) => {
    const array = data.trim().split(/\s+/);
    setGx(convertGData(array[1]));
    setGy(convertGData(array[2]));
    setGz(convertGData(array[3]));
    const p1Value = convertSensorData(array[4] + array[5]);
    updateP1(p1Value);
    let p2Values : string[] = [];
    for (let i = 6; i < 26; i++) {   
        const p2Value = array[i] + array[i+1]
        p2Values.push(convertSensorData(p2Value));
        i++;
    }
    console.log('Lunghezza array valori:', array.length);
    updateP2(p2Values);
}

const convertGData = (gData : string) => {
    const g = parseInt(gData, 16);
    const gX = (g * 0.015625) - 2;
    return gX.toString();
}

const convertSensorData = (sData : string) => {
    const s = parseInt(sData, 16);
    const sX = (s * 0.0000254312) - 0.33333;
    return sX.toString();
}