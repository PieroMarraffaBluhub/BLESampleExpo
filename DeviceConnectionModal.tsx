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

type DeviceModalListItemProps = {
  selectedDevice: Device;
  connectToPeripheral: (device: Device) => void;
  closeModal: () => void;
  onDeviceSelected: (device: Device) => void;
};

type DeviceModalProps = {
  devices: Device[];
  visible: boolean;
  connectToPeripheral: (device: Device) => void;
  closeModal: () => void;
  onDeviceSelected: (device: Device) => void;
  selectedDevice: Device | null | undefined;
};

const DeviceModalListItem: FC<DeviceModalListItemProps> = (props) => {
  const { selectedDevice, closeModal, onDeviceSelected } = props;

  const handleItemClick = useCallback(() => {
    onDeviceSelected(selectedDevice);
    closeModal();
  }, [closeModal, selectedDevice, onDeviceSelected]);

  return (
    <TouchableOpacity
      onPress={handleItemClick}
      style={modalStyle.ctaButton}
    >
      <Text style={modalStyle.ctaButtonText}>
        {selectedDevice.id === "02:80:E1:00:00:00" ? "othis" : selectedDevice.id}
      </Text>
    </TouchableOpacity>
  );
};

const DeviceModal: FC<DeviceModalProps> = (props) => {
  const { devices, visible, connectToPeripheral, closeModal, onDeviceSelected, selectedDevice } = props;

  const renderDeviceModalListItem = useCallback(
    (item: ListRenderItemInfo<Device>) => {
      return (
        <DeviceModalListItem
          selectedDevice={item.item}
          connectToPeripheral={connectToPeripheral}
          closeModal={closeModal}
          onDeviceSelected={onDeviceSelected}
        />
      );
    },
    [closeModal, connectToPeripheral, onDeviceSelected, selectedDevice]
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
