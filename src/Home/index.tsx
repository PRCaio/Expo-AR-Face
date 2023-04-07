import { useEffect, useState } from 'react';
import { View, Text, ImageSourcePropType } from 'react-native';
import { Camera, CameraType, FaceDetectionResult } from 'expo-camera';
import * as FaceDetector from 'expo-face-detector';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated'

import neutral from '../assets/neutral.png';
import smile from '../assets/smile.png';
import winking from '../assets/winking.png';



import { styles } from './styles';

export function Home() {
    const [faceDetected, setFaceDetected] = useState(false);
    const [permission, requestPermission] = Camera.useCameraPermissions();
    const [emoji, setEmoji] = useState<ImageSourcePropType>(neutral);

    const faceValues = useSharedValue({
        width: 0,
        height: 0,
        x: 0,
        y: 0
    });


    function handleFacesDetected({ faces }: FaceDetectionResult) {
        const face = faces[0] as any;

        if (face) {
            const { size, origin } = face.bounds;

            faceValues.value = {
                width: size.width,
                height: size.height,
                x: origin.x,
                y: origin.y
            }
            setFaceDetected(true);

            if(face.smilingProbability > 0.5){
                setEmoji(smile);
            }else if(face.leftEyeOpenProbability > 0.5 && face.rightEyeOpenProbability< 0.5){
                setEmoji(winking)

            }else{
                setEmoji(neutral);
            }
            //console.log(faces);

        } else {
            setFaceDetected(false);
        }
    }

    const animatedStyle = useAnimatedStyle(() => ({
        position: 'absolute',
        zIndex: 1,
        width: faceValues.value.width,
        height: faceValues.value.width,
        transform: [
            { translateX: faceValues.value.x },
            { translateY: faceValues.value.y }
        ],
        //borderColor: 'blue',
        //borderWidth: 10
    }))
    useEffect(() => {
        requestPermission();
    }, []);

    if (!permission?.granted) {
        return (
            <View style={styles.container}>
                <Text>A permissão de câmera não foi concedida.</Text>
            </View>
        )

    }

    return (
        <View style={styles.container}>
            {
                faceDetected &&
                //<Animated.View style={animatedStyle} />
                <Animated.Image
                    style={animatedStyle}
                    source={emoji}
                />
            }
           
            
            <Camera
                style={styles.camera}
                type={CameraType.front}
                onFacesDetected={handleFacesDetected}
                faceDetectorSettings={{
                    mode: FaceDetector.FaceDetectorMode.fast,
                    detectLandmarks: FaceDetector.FaceDetectorLandmarks.all,
                    runClassifications: FaceDetector.FaceDetectorClassifications.all,
                    minDetectionInterval: 100,
                    tracking: true,
                }}
            />
            <View style={{flex: 1, flexDirection: 'row', backgroundColor: 'black'}} />
        </View>
    );
}


