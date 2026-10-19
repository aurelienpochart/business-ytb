import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
// Qualité maximale (consigne d'aurelien) : H.264 en CRF bas, audio AAC 320 kb/s.
Config.setCodec('h264');
Config.setCrf(16);
Config.setAudioBitrate('320k');
Config.setPixelFormat('yuv420p');
