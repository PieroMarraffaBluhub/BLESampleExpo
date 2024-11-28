import React, { useCallback, useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { PulseIndicator } from "./PulseIndicator";
import useBLE from "./useBLE";
import { Device } from "react-native-ble-plx";
import { getData } from "./connectionUtils";
/* import { LineChart } from "react-native-chart-kit";
 */import { Dimensions, LogBox } from "react-native";

LogBox.ignoreLogs([
  "`new NativeEventEmitter()` was called with a non-null argument without the required `addListener` method.",
  "`new NativeEventEmitter()` was called with a non-null argument without the required `removeListeners` method.",
]);

const App = () => {
  const [manufacturerData, setManufacturerData] = useState<string | null>(null);
  const [previousManufacturerData, setPreviousManufacturerData] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [firstRun, setFirstRun] = useState<boolean>(true);
  const [othis, setOthis] = useState<Device | null>();

  const [gx, setGx] = useState<string | null>(null);
  const [gy, setGy] = useState<string | null>(null);
  const [gz, setGz] = useState<string | null>(null);
  const [p1Data, setP1Data] = useState<string[]>([]);
  const [p2Data, setP2Data] = useState<string[]>([]);

  const onDeviceFound = useCallback((device: Device) => {
    setOthis(device); // Aggiorna il dispositivo selezionato
  }, []);


  const {
    requestPermissions,
    scanForPeripherals,
    forceBlockScan
  } = useBLE(onDeviceFound); // Passa la funzione per aggiornare il dispositivo selezionato

  const screenWidth = Dimensions.get("window").width;
  const numericP1Data = p1Data.map((value) => parseInt(value, 10) || 0);

  // Funzione per aggiornare i dati del manufacturer
  const updateManufacturerData = (hexString: string) => {
    setManufacturerData(hexString);
    setPreviousManufacturerData((prevData) => [...prevData, hexString]);
  };

  const updateP1 = (p1Value: string) => {
    setP1Data((prevData) => [...prevData, p1Value]);
  }

  const updateP2 = (p2Values: string[]) => {
    for (let i = 0; i < p2Values.length; i++) {
      const p2Value = p2Values[i]
      setP2Data((prevData) => [...prevData, p2Value]);
    }
  }

  const firstTimeConnection = async () => {
    setIsSearching(true);
    setFirstRun(false);
    setPreviousManufacturerData([]);
    connectOthis();
  }

  const connectOthis = async () => {
    setIsSearching(true);
    setIsRefreshing(true);
    setOthis(null); // Resetta lo stato precedente
    const isPermissionsEnabled = await requestPermissions();

    if (isPermissionsEnabled) {
      console.log("Inizio scansione");
      scanForPeripherals();
    }
  };

  useEffect(() => {
    if (othis) {
      setIsSearching(false);
      console.log("Othis trovato:", othis);
      getData(othis, setGx, setGy, setGz, updateP1, updateP2);
      setIsRefreshing(true);
    }
  }, [othis]);

  useEffect(() => {
    if (othis && onDeviceFound) {
      console.log("Notifico dispositivo trovato.");
      onDeviceFound(othis);
    }
  }, [othis, onDeviceFound]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    if (othis && isRefreshing) {
      intervalId = setInterval(() => {
        console.log("Aggiorno i dati di othis...");
        connectOthis();
      }, 500);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [othis, isRefreshing]);

  const stopRefreshing = () => {
    setIsSearching(false);
    forceBlockScan();
    setIsRefreshing(false);
  };

  const clearHistory = () => {
    setP1Data([]);
    setP2Data([]);
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          {firstRun ? (
            <>
              <Text style={styles.dataText}>
                Please Connect to Othis
              </Text>
            </>
          ) : isSearching || isRefreshing ? (
            <>
              <View style={styles.runningWrapper}>
                <PulseIndicator />
              </View>
            </>
          ) : (
            <>
              <Text style={styles.dataText}>YOUR DATA ARE:</Text>
            </>
          )
          }
        </View>

        {/* Sezione valori Gx, Gy, Gz */}
        <View style={styles.gValuesContainer}>
          <Text style={styles.gValueText}>Gx: {gx || "-"}</Text>
          <Text style={styles.gValueText}>Gy: {gy || "-"}</Text>
          <Text style={styles.gValueText}>Gz: {gz || "-"}</Text>
        </View>

        {/* Seconda ScrollView: p1Data */}
        <View style={styles.scrollViewWrapper}>
          <Text style={styles.scrollViewTitle}>P1 Data:</Text>
          <ScrollView style={styles.scrollView}>
            {p1Data.slice().reverse().map((data, index) => (
              <Text key={index} style={styles.previousDataText}>
                {p1Data.length - index}. {data}
              </Text>
            ))}
          </ScrollView>
        </View>

        {/* Seconda ScrollView: p2Data */}
        <View style={styles.scrollViewWrapper}>
          <Text style={styles.scrollViewTitle}>P2 Data:</Text>
          <ScrollView style={styles.scrollView}>
            {p2Data.slice().reverse().map((data, index) => (
              <Text key={index} style={styles.previousDataText}>
                {p2Data.length - index}. {data}
              </Text>
            ))}
          </ScrollView>
        </View>

      </ScrollView>
      {firstRun ? (
        <>
          <TouchableOpacity
            onPress={firstTimeConnection}
            style={styles.ctaButton}
          >
            <Text style={styles.ctaButtonText}>
              Connect
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TouchableOpacity
            onPress={isRefreshing ? stopRefreshing : connectOthis}
            style={styles.ctaButton}
          >
            <Text style={styles.ctaButtonText}>
              {isRefreshing ? "STOP" : "RESTART"}
            </Text>
          </TouchableOpacity>
          {p1Data.length > 0 ? (
            <>
              <TouchableOpacity
                onPress={clearHistory}
                style={styles.ctaButton}
              >
                <Text style={styles.ctaButtonText}>
                  CLEAR HISTORY
                </Text>
              </TouchableOpacity>
            </>
          ) : null}
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    justifyContent: "center",
  },
  runningWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  runningText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
    marginLeft: 10,
  },
  dataText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
  },
  gValuesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  gValueText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
  },
  scrollViewWrapper: {
    marginVertical: 10,
  },
  scrollViewTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    color: "black",
  },
  scrollView: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 10,
    maxHeight: 200, // Imposta l'altezza massima
  },
  previousDataText: {
    fontSize: 16,
    color: "gray",
    marginVertical: 5,
  },
  ctaButton: {
    backgroundColor: "#FF6060",
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    marginBottom: 10,
    borderRadius: 8,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  chartWrapper: {
    marginVertical: 10,
  },
});

export default App;
