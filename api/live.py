from http.server import BaseHTTPRequestHandler
import json
import os
import urllib.request
import urllib.error
from googleapiclient.discovery import build

import datetime

KV_URL = os.environ.get("KV_REST_API_URL")
KV_TOKEN = os.environ.get("KV_REST_API_TOKEN")

def get_cached_data():
    if not KV_URL or not KV_TOKEN:
        return None
    
    req = urllib.request.Request(
        f"{KV_URL}/get/youtube_live_data",
        headers={"Authorization": f"Bearer {KV_TOKEN}"}
    )
    try:
        with urllib.request.urlopen(req) as response:
            res = json.loads(response.read().decode())
            if res.get("result"):
                return json.loads(res["result"])
    except Exception as e:
        print("KV GET Error:", e)
    return None

def set_cached_data(data):
    if not KV_URL or not KV_TOKEN:
        return
    
    # Store the JSON string encoded as another JSON string for KV (it stores strings)
    value = json.dumps(json.dumps(data))
    
    req = urllib.request.Request(
        f"{KV_URL}/set/youtube_live_data",
        data=value.encode('utf-8'),
        headers={
            "Authorization": f"Bearer {KV_TOKEN}",
            "Content-Type": "application/json"
        },
        method="POST"
    )
    try:
        urllib.request.urlopen(req)
        
        # Determine dynamic expiration time based on IST
        # IST is UTC + 5:30
        now_utc = datetime.datetime.utcnow()
        ist_offset = datetime.timedelta(hours=5, minutes=30)
        now_ist = now_utc + ist_offset
        
        # If time is between 7:30 AM and 10:30 AM IST, cache for 5 minutes (300 seconds)
        # Otherwise, cache for 2 hours (7200 seconds)
        # We can adjust these windows based on exact livestreaming habits
        is_live_window = now_ist.hour == 7 and now_ist.minute >= 30 or \
                         now_ist.hour in [8, 9] or \
                         now_ist.hour == 10 and now_ist.minute <= 30
        
        expiration_seconds = 300 if is_live_window else 7200
        
        req_exp = urllib.request.Request(
            f"{KV_URL}/expire/youtube_live_data/{expiration_seconds}",
            headers={"Authorization": f"Bearer {KV_TOKEN}"},
            method="POST"
        )
        urllib.request.urlopen(req_exp)
    except Exception as e:
        print("KV SET Error:", e)

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            # 1. Attempt to get data from Vercel KV Cache
            data = get_cached_data()
            
            # 2. If not in cache, fetch from YouTube API
            if not data:
                API_KEY = os.environ.get("YOUTUBE_API_KEY", "AIzaSyDZbY4co97HRx3eyIShNSJX5PuWBNk5V78")
                CHANNEL_ID = "UC4IEe3gMst3nTRVWKJfd8Ng"
                
                youtube = build("youtube", "v3", developerKey=API_KEY)
                data = {}
                
                # -----------------------------
                # LIVE STREAM
                # -----------------------------
                live_request = youtube.search().list(
                    part="snippet",
                    channelId=CHANNEL_ID,
                    eventType="live",
                    type="video",
                    maxResults=1
                )
                live_response = live_request.execute()
                
                if live_response.get("items"):
                    item = live_response["items"][0]
                    video_id = item["id"]["videoId"]
                    data["live"] = {
                        "status": True,
                        "title": item["snippet"]["title"],
                        "link": f"https://youtube.com/watch?v={video_id}",
                        "thumbnail": item["snippet"]["thumbnails"]["high"]["url"]
                    }
                else:
                    data["live"] = {"status": False}
                    
                # -----------------------------
                # UPCOMING STREAM
                # -----------------------------
                upcoming_request = youtube.search().list(
                    part="snippet",
                    channelId=CHANNEL_ID,
                    eventType="upcoming",
                    type="video",
                    maxResults=1
                )
                upcoming_response = upcoming_request.execute()
                
                if upcoming_response.get("items"):
                    item = upcoming_response["items"][0]
                    video_id = item["id"]["videoId"]
                    data["upcoming"] = {
                        "title": item["snippet"]["title"],
                        "link": f"https://youtube.com/watch?v={video_id}",
                        "thumbnail": item["snippet"]["thumbnails"]["high"]["url"]
                    }
                else:
                    data["upcoming"] = None
                    
                # -----------------------------
                # LATEST VIDEO
                # -----------------------------
                latest_request = youtube.search().list(
                    part="snippet",
                    channelId=CHANNEL_ID,
                    order="date",
                    maxResults=1,
                    type="video"
                )
                latest_response = latest_request.execute()
                
                if latest_response.get("items"):
                    item = latest_response["items"][0]
                    video_id = item["id"]["videoId"]
                    data["latest"] = {
                        "title": item["snippet"]["title"],
                        "link": f"https://youtube.com/watch?v={video_id}",
                        "thumbnail": item["snippet"]["thumbnails"]["high"]["url"]
                    }
                    
                # Cache the fresh data in Vercel KV for 1 hour
                set_cached_data(data)
                
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            
            # CORS headers to allow frontend to fetch from this API
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept')
            
            self.end_headers()
            self.wfile.write(json.dumps(data).encode('utf-8'))
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            
            # CORS headers
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
            
            self.end_headers()
            error_data = {"error": str(e)}
            self.wfile.write(json.dumps(error_data).encode('utf-8'))

    # Handle CORS preflight requests
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept')
        self.end_headers()
