export async function checkPermission(name: PermissionName): Promise<{ state: string, granted: boolean }> {
    var permission = await navigator.permissions.query({ name: name });
    return { state: permission.state, granted: permission.state === "granted" };
}

// function checkMicrophonePermission() {
//     var permission = navigator.permissions.query({ name: 'microphone' });
//     if (permission.state == "prompt") {
//         // Do something
//     }
// }

// Check if microphone permission is blocked by an extension
// function checkMicrophonePermissionBlockedByExtension() {
//     var extensions = chrome.extensions.getInstalledExtensions();
//     for (var i = 0; i < extensions.length; i++) {
//         if (extensions[i].permissions && extensions[i].permissions.indexOf('microphone') !== -1) {
//             return true;
//         }
//     }
//     return false;
// }
