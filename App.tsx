import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DeviceModal from "./DeviceConnectionModal";
import { PulseIndicator } from "./PulseIndicator";
import useBLE from "./useBLE";

const App = () => {
  const {
    requestPermissions,
    scanForPeripherals,
    allDevices,
    connectToDevice,
    connectedDevice,
    heartRate,
    disconnectFromDevice,
  } = useBLE();

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [manufacturerData, setManufacturerData] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Funzione per aggiornare i dati del manufacturer
  const updateManufacturerData = (hexString: string) => {
    setManufacturerData(hexString);
  };

  const scanForDevices = async () => {
    const isPermissionsEnabled = await requestPermissions();
    if (isPermissionsEnabled) {
      scanForPeripherals();
    }
  };

  const hideModal = () => {
    setIsModalVisible(false);
  };

  const openModal = async () => {
    scanForDevices();
    setIsModalVisible(true);
  };

  // Imposta un intervallo per aggiornare i dati del manufacturer ogni 2 secondi
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    if (isRefreshing) {
      intervalId = setInterval(() => {
        if (manufacturerData) {
          console.log("Refreshing Manufacturer Data:", manufacturerData);
        }
      }, 2000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId); // Pulisce l'intervallo quando il componente viene smontato o il ciclo è fermato
    };
  }, [manufacturerData, isRefreshing]);

  const stopRefreshing = () => {
    setIsRefreshing(false);
  };

  // Funzione per riprendere il ciclo di refresh
  const startRefreshing = () => {
    setIsRefreshing(true);
  };

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
        onPress={isRefreshing ? stopRefreshing : openModal}
        style={styles.ctaButton}
      >
        <Text style={styles.ctaButtonText}>
          {isRefreshing ? "Disconnect" : "Connect"}
        </Text>
      </TouchableOpacity>
      <DeviceModal
        closeModal={hideModal}
        visible={isModalVisible}
        connectToPeripheral={connectToDevice}
        devices={allDevices}
        updateManufacturerData={updateManufacturerData}
        startRefreshing={startRefreshing}
      />
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
