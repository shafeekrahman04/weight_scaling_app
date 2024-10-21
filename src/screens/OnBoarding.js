import React, {useState, useRef, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
  Image,
  TouchableOpacity,
  Animated,
} from 'react-native';

const {width, height} = Dimensions.get('window');

export default function OnBoarding() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef(null);
  const animatedValue = useRef(new Animated.Value(0)).current;

  const pages = [
    {
      title: 'Track Your Weight Easily',
      description: 'Log your daily weight and see your progress over time.',
      image:
        'https://firebasestorage.googleapis.com/v0/b/fir-3b89d.appspot.com/o/onboarding%2Fonboard3.jpg?alt=media&token=6a466bb9-0fba-4642-b956-64d99d8945d4',
    },
    {
      title: 'Monitor Your Progress',
      description:
        'Stay motivated with visual progress and detailed analytics.',
      image:
        'https://firebasestorage.googleapis.com/v0/b/fir-3b89d.appspot.com/o/onboarding%2Fonboard2.jpg?alt=media&token=6a466bb9-0fba-4642-b956-64d99d8945d4',
    },
    {
      title: 'Start Now',
      description:
        'Join our community and achieve your weight goals effortlessly.',
      image:
        'https://firebasestorage.googleapis.com/v0/b/fir-3b89d.appspot.com/o/onboarding%2Fonboard1.jpg?alt=media&token=754e90e9-d2a1-4e86-bfa8-098b51afb0fb',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % pages.length;
      setCurrentIndex(nextIndex);
      scrollViewRef.current.scrollTo({x: width * nextIndex, animated: true});
    }, 4000); // Auto-scroll every 4 seconds
    return () => clearInterval(interval);
  }, [currentIndex]);

  const animatedDotStyle = index => {
    const isActive = currentIndex === index;

    return {
      width: isActive ? 24 : 8,
      height: 8,
      backgroundColor: isActive ? '#4CAF50' : '#bbb',
      marginHorizontal: 4,
    };
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        onMomentumScrollEnd={event => {
          const index = Math.floor(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
          Animated.timing(animatedValue, {
            toValue: index,
            duration: 300,
            useNativeDriver: false,
          }).start();
        }}>
        {pages.map((page, index) => (
          <View key={index} style={styles.page}>
            <Image source={{uri: page.image}} style={styles.image} />
            <Text style={styles.title}>{page.title}</Text>
            <Text style={styles.description}>{page.description}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {pages.map((_, index) => (
          <Animated.View
            key={index}
            style={[styles.dot, animatedDotStyle(index)]}
          />
        ))}
      </View>

      {/* Button Container */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Create Account</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.siginBtn]}>
          <Text style={[styles.buttonText,styles.siginBtnText]}>
            Sign In
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  page: {
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  image: {
    width: '80%',
    height: '50%',
    resizeMode: 'contain',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 200,
    left: 0,
    right: 0,
  },
  dot: {
    height: 10,
    width: 10,
    backgroundColor: '#bbb',
    borderRadius: 5,
    marginHorizontal: 5,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    marginVertical: 5,
    borderRadius: 10,
    alignItems: 'center',
  },
  siginBtn: {
    backgroundColor: '#fff',
    //   borderColor: '#4CAF50',
    //   borderWidth: 2,
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  siginBtnText: {
    color: '#4CAF50',
  },
});
