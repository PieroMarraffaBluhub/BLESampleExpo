import React, { FC, useCallback } from "react";
import {
  FlatList,
  ListRenderItemInfo,
  Modal,
  SafeAreaView,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Device } from "react-native-ble-plx";
import RNFetchBlob from 'rn-fetch-blob';

type DeviceModalListItemProps = {
  item: ListRenderItemInfo<Device>;
  connectToPeripheral: (device: Device) => void;
  closeModal: () => void;
  updateManufacturerData: (hexString: string) => void;
  startRefreshing: () => void;
};

type DeviceModalProps = {
  devices: Device[];
  visible: boolean;
  connectToPeripheral: (device: Device) => void;
  closeModal: () => void;
  updateManufacturerData: (hexString: string) => void;
  startRefreshing: () => void;
};

const DeviceModalListItem: FC<DeviceModalListItemProps> = (props) => {
  const { item, updateManufacturerData, closeModal, startRefreshing } = props;

  const handleItemClick = useCallback(() => {
    // Stampa i manufacturer data quando l'utente clicca sulla card
    if (item.item.manufacturerData) {

      // Decodifica la stringa Base64 in un array di byte
      const advertisingBinary = RNFetchBlob.base64.decode(item.item.manufacturerData);

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
      startRefreshing();
    } else {
      console.log("No manufacturer data available.");
    }

    // Chiudiamo il modal dopo aver stampato i dati
    closeModal();
  }, [closeModal, item.item, updateManufacturerData, startRefreshing]);

  return (
    <TouchableOpacity
      onPress={handleItemClick}
      style={modalStyle.ctaButton}
    >
      <Text style={modalStyle.ctaButtonText}>
        {item.item.id === "02:80:E1:00:00:00" ? "othis" : item.item.id}
      </Text>
    </TouchableOpacity>
  );
};

const DeviceModal: FC<DeviceModalProps> = (props) => {
  const { devices, visible, connectToPeripheral, closeModal, updateManufacturerData, startRefreshing } = props;

  const renderDeviceModalListItem = useCallback(
    (item: ListRenderItemInfo<Device>) => {
      return (
        <DeviceModalListItem
          item={item}
          connectToPeripheral={connectToPeripheral}
          closeModal={closeModal}
          updateManufacturerData={updateManufacturerData}
          startRefreshing={startRefreshing}
        />
      );
    },
    [closeModal, connectToPeripheral, updateManufacturerData, startRefreshing]
  );

  return (
    <Modal
      style={modalStyle.modalContainer}
      animationType="slide"
      transparent={false}
      visible={visible}
    >
      <SafeAreaView style={modalStyle.modalTitle}>
        <Text style={modalStyle.modalTitleText}>
          Tap on a device to connect
        </Text>

        {/* FlatList per la lista scrollabile */}
        <FlatList
          contentContainerStyle={modalStyle.modalFlatlistContiner}
          data={devices}
          renderItem={renderDeviceModalListItem}
        />
      </SafeAreaView>
    </Modal>
  );
};

const modalStyle = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  modalFlatlistContiner: {
    flexGrow: 1, // Aggiungi flexGrow per permettere che la lista si espanda se ci sono molti dispositivi
    justifyContent: "flex-start", // Allinea gli elementi in alto
    paddingBottom: 10, // Aggiungi spazio in fondo per il scrolling
  },
  modalTitle: {
    backgroundColor: "#f2f2f2",
    paddingTop: 40,
  },
  modalTitleText: {
    fontSize: 30,
    fontWeight: "bold",
    marginHorizontal: 20,
    textAlign: "center",
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

export default DeviceModal;
