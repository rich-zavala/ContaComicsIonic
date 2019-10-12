rm -rf ./node_modules
rm -rf ./platforms
rm -rf ./plugins
npm install
cordova prepare
cordova plugin add https://github.com/ourcodeworld/cordova-ourcodeworld-filebrowser.git
ionic cordova build android
echo "Update the AndroidManifest with 'android:usesCleartextTraffic="true"'"