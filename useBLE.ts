/* eslint-disable no-bitwise */
import { useEffect, useMemo, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import {
  BleManager,
  Device,
} from "react-native-ble-plx";
import * as ExpoDevice from "expo-device";

interface BluetoothLowEnergyApi {
  requestPermissions(): Promise<boolean>;
  scanForPeripherals(): void;
}

function useBLE(onDeviceFound?: (device: Device) => void): BluetoothLowEnergyApi {
  const bleManager = useMemo(() => new BleManager(), []);
  const [othis, setOthis] = useState<Device | null>(null);

  const requestAndroid31Permissions = async () => {
    const bluetoothScanPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      {
        title: "Location Permission",
        message: "Bluetooth Low Energy requires Location",
        buttonPositive: "OK",
      }
    );
    const bluetoothConnectPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      {
        title: "Location Permission",
        message: "Bluetooth Low Energy requires Location",
        buttonPositive: "OK",
      }
    );
    const fineLocationPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: "Location Permission",
        message: "Bluetooth Low Energy requires Location",
        buttonPositive: "OK",
      }
    );

    return (
      bluetoothScanPermission === "granted" &&
      bluetoothConnectPermission === "granted" &&
      fineLocationPermission === "granted"
    );
  };

  const requestPermissions = async () => {
    if (Platform.OS === "android") {
      if ((ExpoDevice.platformApiLevel ?? -1) < 31) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message: "Bluetooth Low Energy requires Location",
            buttonPositive: "OK",
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const isAndroid31PermissionsGranted =
          await requestAndroid31Permissions();

        return isAndroid31PermissionsGranted;
      }
    } else {
      return true;
    }
  };

  const scanForPeripherals = () => {
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error("Scan error:", error.message);
        bleManager.stopDeviceScan(); // Interrompiamo la scansione in caso di errore critico
        return;
      }

      if (device) {
        console.log("Device found:", device.id);

        // Controlla se è il dispositivo desiderato
        if (device.id === "02:80:E1:00:00:00") {
          console.log("Found Othis:", device);
          bleManager.stopDeviceScan();
          console.log("blocco scan");
          setOthis(device)
          
      }
    }});
  };

  useEffect(() => {
    if (othis && onDeviceFound) {
      console.log("notifico");
      onDeviceFound(othis); // Notifica il componente principale che un dispositivo è stato trovato
    }
  }, [othis, onDeviceFound]);

  return {
    scanForPeripherals,
    requestPermissions
  };
}

export default useBLE;
