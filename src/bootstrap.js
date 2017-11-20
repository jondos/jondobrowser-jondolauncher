const {classes: Cc, interfaces: Ci, utils: Cu, results: Cr} = Components;
Cu.import('resource://gre/modules/Services.jsm');
let prefsService = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService);

var p = null;

function install() {}
function uninstall() {} 
function shutdown(data, reason) {
	// check if JonDo automatic shutdown is enabled
	var jondoAutoShutdown = true;
    try{
        if(prefsService){
            let prefsBranch = prefsService.getBranch("extensions.JonDo.");
            if(prefsBranch){
                jondoAutoShutdown = prefsBranch.getBoolPref("automatic_shutdown");
            }
        }
    }catch(e){
        console.log(e);
    }
    if(jondoAutoShutdown){
		toggleJondo("off");
	}
}
function startup() {
	toggleJondo("on");
}

function toggleJondo(flag) {
	try{
		var xr = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULRuntime);
      	var mOS = xr.OS;    	

		let topDir = Cc["@mozilla.org/file/directory_service;1"].getService(Ci.nsIProperties).get("CurProcD", Ci.nsIFile);
		let appInfo = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULAppInfo);

		//Services.prompt.alert(null, "Launching JonDo", mOS + "\n" + topDir.path + "\n" + appInfo.ID);

		// On Linux and Windows, we want to return the Browser/ directory.
		// Because topDir ("CurProcD") points to Browser/browser on those
		// platforms, we need to go up one level.
		// On Mac OS, we want to return the TorBrowser.app/ directory.
		// Because topDir points to Contents/Resources/browser on Mac OS,
		// we need to go up 3 levels.
		
		let tbbBrowserDepth = (mOS == "Darwin") ? 3 : 1;
		if ((appInfo.ID == "{3550f703-e582-4d05-9a08-453d09bdfdc6}") || (appInfo.ID == "{33cb9019-c295-46dd-be21-8c4936574bee}"))
		{
			// On Thunderbird/Instantbird, the topDir is the root dir and not
			// browser/, so we need to iterate one level less than Firefox.
			--tbbBrowserDepth;
		}
		while (tbbBrowserDepth > 0)
		{
			let didRemove = (topDir.leafName != ".");
			topDir = topDir.parent;
			if (didRemove){
			    tbbBrowserDepth--;
			}
		}

		let file = topDir.clone();
        if(mOS == "WINNT"){
      		file.appendRelativePath("JonDo\\JonDoLauncher.exe");
      	}else if(mOS == "Darwin"){
			file.appendRelativePath("Contents/MacOS/JonDo/JonDoLauncher");
      	}else{
			file.appendRelativePath("JonDo/JonDoLauncher");
      	}
        //Services.prompt.alert(null, "Launching JonDo", file.path);

        if (file.exists())
	    {
	        try { file.normalize(); } catch(e) {}
	        
	        var args=[];
	        if(mOS == "Darwin"){
	        	//Services.prompt.alert(null, "Launching JonDo on OS X", topDir.path);
	        	args.push(topDir.path);
	        }
	        if(flag == "on"){
		        args.push("on");
		    }else{
		    	args.push("off");
		    }
			p = Cc["@mozilla.org/process/util;1"].createInstance(Ci.nsIProcess);
	        p.init(file);
			p.run(false, args, args.length);
	    }else{
	    	//Services.prompt.alert(null,"tor","Cannot initialize JonDo.");	
	    }
	}catch(e){
		//Services.prompt.alert(null,"tor",e);
	}
}