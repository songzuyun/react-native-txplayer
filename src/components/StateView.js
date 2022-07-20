import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { Button } from 'react-native-elements';

import ControlIcon from './ControlIcon';

const styles = StyleSheet.create({
  stateViewLoading: {
    maxWidth: '50%',
  },
  stateViewError: {
    // width: 200,
    alignItems: 'center',
  },
  textError: {
    color: 'white',
    alignSelf: 'center',
    fontSize: 14,
    marginBottom: 10,
  },
  textLoading: {
    color: 'white',
    alignSelf: 'center',
    fontSize: 12,
  },
  textLoadingTitle: {
    fontSize: 12,
    color: 'white',
    alignSelf: 'center',
    marginTop: 10,
  },
});

function StateView({
  isPlaying,
  isLoading,
  isError,
  loadingObj,
  errorObj,
  onPressPlay,
  onPressReload,
  themeColor,
  isAdEnd,
}) {
  const { percent } = loadingObj;
  const { message } = errorObj;
  let showMessage = '播放出错';
  if (message) showMessage = `播放出错:${message}`;

  let view = null;
  if (isLoading) {
    view = (
      <View style={styles.stateViewLoading}>
        <ActivityIndicator size="large" color={themeColor} />
        <Text style={styles.textLoading}>
          <Text>缓冲中...</Text>
          {!!percent && <Text>{`${percent}%`}</Text>}
        </Text>
      </View>
    );
  }
  if (!isPlaying) {
    view = (
      <View>
        <ControlIcon type={'ionicon'} onPress={onPressPlay} size={40} name="play" />
      </View>
    );
  }
  if (isAdEnd) {
    view = (
      <View style={styles.stateViewLoading}>
        <ActivityIndicator size="large" color={themeColor} />
        <Text style={styles.textLoading}>
          <Text>缓冲中...</Text>
          {!!percent && <Text>{`${percent}%`}</Text>}
        </Text>
      </View>
    );
  }
  if (isError) {
    view = (
      <View style={styles.stateViewError}>
        <Text style={styles.textError} numberOfLines={1} ellipsizeMode="tail">
          {showMessage}
        </Text>
        <Button
          title="重试"
          titleStyle={{ fontSize: 12 }}
          buttonStyle={{ paddingHorizontal: 24, backgroundColor: themeColor }}
          onPress={onPressReload}
        />
      </View>
    );
  }
  return view;
}

export default StateView;
