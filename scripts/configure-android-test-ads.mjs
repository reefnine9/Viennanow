import fs from 'node:fs';
import path from 'node:path';

const javaFile=path.resolve('android/app/src/main/java/app/viennanow/travel/MainActivity.java');
const gradleFile=path.resolve('android/app/build.gradle');
const manifestFile=path.resolve('android/app/src/main/AndroidManifest.xml');
for(const file of [javaFile,gradleFile,manifestFile])if(!fs.existsSync(file))throw Error('Missing generated Android file: '+file);
const java=`package app.viennanow.travel;

import android.os.Bundle;
import android.graphics.Color;
import android.view.Gravity;
import android.view.View;
import android.webkit.WebView;
import org.json.JSONObject;
import com.google.android.gms.ads.AdListener;
import com.google.android.gms.ads.LoadAdError;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.widget.TextView;
import android.widget.Toast;
import com.getcapacitor.BridgeActivity;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.AdSize;
import com.google.android.gms.ads.AdView;
import com.google.android.gms.ads.MobileAds;
import com.google.android.ump.ConsentInformation;
import com.google.android.ump.ConsentRequestParameters;
import com.google.android.ump.UserMessagingPlatform;

public class MainActivity extends BridgeActivity {
  private static final String TEST_BANNER_ID = "ca-app-pub-3940256099942544/6300978111";
  private AdView banner;
  private FrameLayout adContainer;
  private WebView webView;
  private ConsentInformation consent;
  private boolean adsStarted = false;

  private int dp(int value) { return Math.round(value * getResources().getDisplayMetrics().density); }

  @Override public void onCreate(Bundle state) {
    super.onCreate(state);
    consent = UserMessagingPlatform.getConsentInformation(this);
    ConsentRequestParameters params = new ConsentRequestParameters.Builder().build();
    consent.requestConsentInfoUpdate(this, params,
      () -> UserMessagingPlatform.loadAndShowConsentFormIfRequired(this, error -> {
        if (error != null) android.util.Log.w("ViennaNowAds", "Consent form: " + error.getMessage());
        if (consent.canRequestAds()) startTestAds();
      }),
      error -> {
        android.util.Log.w("ViennaNowAds", "Consent update: " + error.getMessage());
        if (consent.canRequestAds()) startTestAds();
      });
    if (consent.canRequestAds()) startTestAds();
  }

  private void startTestAds() {
    if (adsStarted) return;
    adsStarted = true;
    MobileAds.initialize(this, status -> {});
    runOnUiThread(() -> {
      FrameLayout root = findViewById(android.R.id.content);
      if (root == null) return;
      webView = getBridge().getWebView();
      adContainer = new FrameLayout(this);
      adContainer.setBackgroundColor(Color.rgb(243,245,242));
      adContainer.setVisibility(View.GONE);
      FrameLayout.LayoutParams barParams = new FrameLayout.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT, dp(54), Gravity.TOP | Gravity.LEFT);
      root.addView(adContainer, barParams);
      banner = new AdView(this);
      banner.setAdUnitId(TEST_BANNER_ID);
      banner.setAdSize(AdSize.BANNER);
      FrameLayout.LayoutParams adParams = new FrameLayout.LayoutParams(
        ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT, Gravity.CENTER);
      adContainer.addView(banner, adParams);
      banner.setAdListener(new AdListener() {
        @Override public void onAdLoaded() { alignBanner(); }
        @Override public void onAdFailedToLoad(LoadAdError error) {
          adContainer.setVisibility(View.GONE);
          android.util.Log.w("ViennaNowAds", "Banner unavailable: " + error.getMessage());
        }
      });
      TextView privacy = new TextView(this);
      privacy.setText("ⓘ");
      privacy.setTextSize(17);
      privacy.setTextColor(Color.DKGRAY);
      privacy.setGravity(Gravity.CENTER);
      privacy.setContentDescription("Ad privacy choices");
      FrameLayout.LayoutParams privacyParams = new FrameLayout.LayoutParams(dp(30),dp(50),Gravity.RIGHT|Gravity.CENTER_VERTICAL);
      adContainer.addView(privacy,privacyParams);
      privacy.setOnClickListener(v -> {
        if (consent.getPrivacyOptionsRequirementStatus() == ConsentInformation.PrivacyOptionsRequirementStatus.REQUIRED) {
          UserMessagingPlatform.showPrivacyOptionsForm(this, error -> {
            if (error != null) Toast.makeText(this,"Privacy options unavailable",Toast.LENGTH_SHORT).show();
          });
        } else {
          Toast.makeText(this,"No additional ad privacy options required",Toast.LENGTH_SHORT).show();
        }
      });
      banner.loadAd(new AdRequest.Builder().build());
    });
  }
  private void alignBanner() {
    if (webView == null || adContainer == null) return;
    webView.evaluateJavascript("(function(){var e=document.getElementById('ad-slot');if(!e)return null;var r=e.getBoundingClientRect();return JSON.stringify({x:r.left,y:r.top,w:r.width,h:r.height,v:innerWidth});})()", result -> {
      try {
        if (result == null || result.equals("null")) return;
        String decoded = new org.json.JSONTokener(result).nextValue().toString();
        JSONObject rect = new JSONObject(decoded);
        float scale = (float) webView.getWidth() / (float) rect.getDouble("v");
        int[] webPos = new int[2], rootPos = new int[2];
        webView.getLocationOnScreen(webPos);
        FrameLayout root = findViewById(android.R.id.content);
        root.getLocationOnScreen(rootPos);
        FrameLayout.LayoutParams params = (FrameLayout.LayoutParams) adContainer.getLayoutParams();
        params.width = Math.round((float) rect.getDouble("w") * scale);
        params.height = Math.round((float) rect.getDouble("h") * scale);
        params.leftMargin = webPos[0] - rootPos[0] + Math.round((float) rect.getDouble("x") * scale);
        params.topMargin = webPos[1] - rootPos[1] + Math.round((float) rect.getDouble("y") * scale);
        if (params.width < dp(320) || params.height < dp(50)) return;
        adContainer.setLayoutParams(params);
        adContainer.setVisibility(View.VISIBLE);
      } catch (Exception ex) { android.util.Log.w("ViennaNowAds", "Banner alignment failed", ex); }
    });
  }
  @Override public void onPause() { if (banner != null) banner.pause(); super.onPause(); }
  @Override public void onResume() { super.onResume(); if (banner != null) banner.resume(); }
  @Override public void onDestroy() { if (banner != null) banner.destroy(); super.onDestroy(); }
}
`;
fs.writeFileSync(javaFile,java);
let gradle=fs.readFileSync(gradleFile,'utf8');
gradle+=`\n// ViennaNow: Google-provided TEST ads only; never use production IDs in closed testing.\ndependencies {\n    implementation 'com.google.android.gms:play-services-ads:23.6.0'\n    implementation 'com.google.android.ump:user-messaging-platform:3.2.0'\n}\n`;
fs.writeFileSync(gradleFile,gradle);
let manifest=fs.readFileSync(manifestFile,'utf8');
if(!manifest.includes('com.google.android.gms.ads.APPLICATION_ID')){
  manifest=manifest.replace(/(<application\b[^>]*>)/, '$1\n        <meta-data android:name="com.google.android.gms.ads.APPLICATION_ID" android:value="ca-app-pub-3940256099942544~3347511713" />');
}
if(!manifest.includes('com.google.android.gms.ads.APPLICATION_ID'))throw Error('Could not configure AdMob application ID');
fs.writeFileSync(manifestFile,manifest);
console.log('ViennaNow Android: test banner and UMP consent integrated (test IDs only).');
