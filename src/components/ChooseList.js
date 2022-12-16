import React, { useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  textCon: {
    borderWidth: 1.5,
    borderColor: 'white',
    borderRadius: 3,
    paddingHorizontal: 6,
    marginLeft: 30,
  },
  text: {
    color: 'white',
    fontSize: 16,
  },
});
function ChooseList({ data = [], themeColor, defaultValue, onChange }) {
  const [value, setValue] = useState(defaultValue);

  const renderItem = (item) => {
    const isSelect = item.value === value;
    const selectStyle = {
      color: themeColor,
    };
    const handlePress = () => {
      if (value !== item.value) {
        setValue(item.value);
        onChange(item);
      }
    };
    return (
      <View style={[styles.textCon, isSelect && { borderColor: themeColor }]}>
        <Text key={item.value} style={[styles.text, isSelect && selectStyle]} onPress={handlePress}>
          {item.label}
        </Text>
      </View>
    );
  };

  return <View style={styles.row}>{data.map(renderItem)}</View>;
}
export default ChooseList;
