import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { PulseIndicator } from "./PulseIndicator";
import useBLE from "./useBLE";
import { Device } from "react-native-ble-plx";
import RNFetchBlob from "rn-fetch-blob";

const App = () => {
  const [manufacturerData, setManufacturerData] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [othis, setOthis] = useState<Device | null>();

  const {
    requestPermissions,
    scanForPeripherals
  } = useBLE(setOthis); // Passa la funzione per aggiornare il dispositivo selezionato

  // Funzione per aggiornare i dati del manufacturer
  const updateManufacturerData = (hexString: string) => {
    setManufacturerData(hexString);
  };

  const connectOthis = async () => {
    console.log('Click su connect');
    setOthis(null); // Resetta lo stato precedente
    const isPermissionsEnabled = await requestPermissions();

    if (isPermissionsEnabled) {
      console.log('Inizio scansione');
      scanForPeripherals();

      // Aspetta che othis venga settato
      const interval = setInterval(() => {
        if (othis) {
          clearInterval(interval);
          console.log('Othis trovato:', othis);
          getData(); // Ottieni i dati solo quando othis è disponibile
          setIsRefreshing(true);
        }
      }, 500); // Controlla ogni mezzo secondo
    }
  };

  // Imposta un intervallo per aggiornare i dati del manufacturer ogni 2 secondi
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    if (othis && isRefreshing) {
      intervalId = setInterval(() => {
        console.log('sto refreshando othis');
        connectOthis();
      }, 2000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId); // Pulisce l'intervallo quando il componente viene smontato o il ciclo è fermato
    };
  }, [manufacturerData, othis]);

  const stopRefreshing = () => {
    setIsRefreshing(false);
  };

  const getData = () => {
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

      hexString = hexString.replace(/([0-9A-F]{2})/g, '_$1').toUpperCase();
      console.log("Manufacturer data as hex string:", hexString);

      updateManufacturerData(hexString);
    } else {
      console.log("No device or manufacturer data available.");
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.heartRateTitleWrapper}>
        {isRefreshing ? (
          <>
            <PulseIndicator />
            <Text style={styles.heartRateTitleText}>Your data are:</Text>
            <Text style={styles.heartRateText}>{manufacturerData} bpm</Text>
          </>
        ) : (
          <Text style={styles.heartRateTitleText}>
            Please Connect to a Heart Rate Monitor
          </Text>
        )}
      </View>
      <TouchableOpacity
        onPress={isRefreshing ? stopRefreshing : connectOthis}
        style={styles.ctaButton}
      >
        <Text style={styles.ctaButtonText}>
          {isRefreshing ? "Disconnect" : "Connect"}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  heartRateTitleWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  heartRateTitleText: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginHorizontal: 20,
    color: "black",
  },
  heartRateText: {
    fontSize: 25,
    marginTop: 15,
  },
  manufacturerDataText: {
    fontSize: 16,
    marginTop: 10,
    color: "gray",
  },
  ctaButton: {
    backgroundColor: "#FF6060",
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    marginHorizontal: 20,
    marginBottom: 5,
    borderRadius: 8,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
});

export default App;
