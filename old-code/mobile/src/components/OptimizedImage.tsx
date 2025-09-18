import React, { useState, useEffect, memo } from 'react';
import { View, Image, StyleSheet, ActivityIndicator, ImageProps, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface OptimizedImageProps extends Omit<ImageProps, 'source'> {
  source: { uri: string };
  fallback?: string;
  containerStyle?: ViewStyle;
  showLoadingIndicator?: boolean;
  thumbnailUri?: string;
}

const OptimizedImage = memo(({
  source,
  style,
  fallback,
  containerStyle,
  showLoadingIndicator = true,
  thumbnailUri,
  ...props
}: OptimizedImageProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageUri, setImageUri] = useState(thumbnailUri || source.uri);

  useEffect(() => {
    if (!thumbnailUri) return;
    
    // Load full resolution image after thumbnail
    const timer = setTimeout(() => {
      setImageUri(source.uri);
    }, 100);

    return () => clearTimeout(timer);
  }, [source.uri, thumbnailUri]);

  const handleLoadStart = () => {
    setLoading(true);
    setError(false);
  };

  const handleLoadEnd = () => {
    setLoading(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
    if (fallback) {
      setImageUri(fallback);
      setError(false);
    }
  };

  const imageStyle = StyleSheet.flatten(style);

  return (
    <View style={[styles.container, containerStyle, imageStyle]}>
      {loading && showLoadingIndicator && (
        <View style={[StyleSheet.absoluteFillObject, styles.loadingContainer]}>
          <ActivityIndicator size="small" color="#999" />
        </View>
      )}
      
      {error && !fallback ? (
        <View style={[StyleSheet.absoluteFillObject, styles.errorContainer]}>
          <Ionicons name="image-outline" size={40} color="#ccc" />
        </View>
      ) : (
        <Image
          {...props}
          source={{ uri: imageUri }}
          style={[imageStyle, { width: '100%', height: '100%' }]}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
          resizeMode={props.resizeMode || 'cover'}
        />
      )}
    </View>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.source.uri === nextProps.source.uri &&
    prevProps.style === nextProps.style &&
    prevProps.fallback === nextProps.fallback &&
    prevProps.thumbnailUri === nextProps.thumbnailUri
  );
});

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
});

export default OptimizedImage;