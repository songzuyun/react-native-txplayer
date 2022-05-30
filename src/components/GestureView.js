import React, { Component } from 'react';
import { View, StyleSheet, PanResponder } from 'react-native';

class App extends Component {
  panResponder = PanResponder.create({
    // 要求成为响应者：
    onStartShouldSetPanResponder: (evt, gestureState) => true,
    onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
    onMoveShouldSetPanResponder: (evt, gestureState) => true,
    onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

    onPanResponderGrant: (evt, gestureState) => {},
    onPanResponderStart: (evt, gestureState) => {},
    onPanResponderEnd: (evt, gestureState) => {},
    onPanResponderMove: this.props.onPanResponderMove,
    onPanResponderRelease: this.props.onPanResponderRelease,
    onPanResponderTerminationRequest: (evt, gestureState) => true,
    onPanResponderTerminate: (evt, gestureState) => {},
    onShouldBlockNativeResponder: (evt, gestureState) => true,
  });

  render() {
    return (
      <View style={styles.container} {...this.panResponder.panHandlers}>
        {this.props.children}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.01)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;
