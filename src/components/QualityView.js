import React from 'react';
import { Text, View, SafeAreaView, StyleSheet } from 'react-native';

import ChooseList from './ChooseList';
import ControlIcon from './ControlIcon';
import { getBitrateLabel } from '../lib/utils';

const styles = StyleSheet.create({
  quality: {
    ...StyleSheet.absoluteFill,
  },
  content: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  block: {},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  textWhite: {
    color: 'white',
    fontSize: 22,
  },
  close: {
    marginTop: 5,
  },
});

function QualityView({
  visible,
  qualityList,
  playSource,
  bitrateList,
  bitrateIndex,
  themeColor,
  onClose,
  onChange,
}) {
  if (!visible) {
    return null;
  }

  //升序
  const compare = (p) => {
    return function (m, n) {
      var a = m[p];
      var b = n[p];
      const numA = a.substring(0, a.length - 1);
      const numB = b.substring(0, b.length - 1);
      return Number(numA) > Number(numB);
    };
  };

  const chooseData = bitrateList.map((o) => {
    return { value: o.index, label: getBitrateLabel(o) };
  });
  const sortChooseData = chooseData.sort(compare('label'));

  return (
    <SafeAreaView style={styles.quality}>
      <View style={styles.content} onPress={onClose}>
        <View style={styles.row}>
          <Text style={styles.textWhite}>清晰度:</Text>
          <ChooseList
            data={qualityList || sortChooseData}
            // defaultValue={playSource || bitrateIndex}
            defaultValue={bitrateIndex}
            themeColor={themeColor}
            onChange={onChange}
          />
        </View>
        <View style={styles.close}>
          <ControlIcon name="closecircleo" onPress={onClose} />
        </View>
      </View>
    </SafeAreaView>
  );
}

export default QualityView;
