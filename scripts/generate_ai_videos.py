import os
import math
import subprocess
import numpy as np
import cv2
import imageio_ffmpeg

BASE_IMG_PATH = r"frontend/public/professor_avatar.png"
SPEAK_IMG_PATH = r"C:\Users\Administrator\.gemini\antigravity-ide\brain\bfe6f466-e4d9-49e9-85c5-f8645f7ef196\professor_speaking_1793637346739.jpg"
BLINK_IMG_PATH = r"C:\Users\Administrator\.gemini\antigravity-ide\brain\bfe6f466-e4d9-49e9-85c5-f8645f7ef196\professor_blink_1793637374284.jpg"

OUT_LISTEN_PATH = r"frontend/public/professor_listening.mp4"
OUT_SPEAK_PATH = r"frontend/public/professor_speaking.mp4"

def load_images():
    base = cv2.imread(BASE_IMG_PATH)
    speak = cv2.imread(SPEAK_IMG_PATH)
    blink = cv2.imread(BLINK_IMG_PATH)
    
    assert base is not None, f"Failed to load {BASE_IMG_PATH}"
    assert speak is not None, f"Failed to load {SPEAK_IMG_PATH}"
    assert blink is not None, f"Failed to load {BLINK_IMG_PATH}"
    
    h, w = base.shape[:2]
    speak = cv2.resize(speak, (w, h), interpolation=cv2.INTER_LANCZOS4)
    blink = cv2.resize(blink, (w, h), interpolation=cv2.INTER_LANCZOS4)
    
    return base, speak, blink, h, w

def apply_motion(img, dx, dy, zoom=1.0):
    """Apply gentle affine shift and micro-zoom for breathing and head motion."""
    h, w = img.shape[:2]
    # Center of face/chest is roughly (w/2, h*0.45)
    cx, cy = w / 2.0, h * 0.45
    
    M = cv2.getRotationMatrix2D((cx, cy), 0, zoom)
    M[0, 2] += dx
    M[1, 2] += dy
    
    return cv2.warpAffine(img, M, (w, h), borderMode=cv2.BORDER_REFLECT)

def write_video_ffmpeg(frames, out_path, fps=30):
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    h, w = frames[0].shape[:2]
    
    cmd = [
        ffmpeg_exe,
        "-y",
        "-f", "rawvideo",
        "-vcodec", "rawvideo",
        "-s", f"{w}x{h}",
        "-pix_fmt", "bgr24",
        "-r", str(fps),
        "-i", "-",
        "-an",
        "-vcodec", "libx264",
        "-pix_fmt", "yuv420p",
        "-crf", "19",
        "-preset", "slow",
        "-movflags", "+faststart",
        out_path
    ]
    
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stderr=subprocess.PIPE)
    for frame in frames:
        proc.stdin.write(frame.tobytes())
    stdout, stderr = proc.communicate()
    
    if proc.returncode != 0:
        print("FFmpeg error:", stderr.decode("utf-8", errors="ignore"))
        raise RuntimeError("FFmpeg encoding failed")
    
    print(f"Successfully generated {out_path} ({len(frames)} frames, size: {os.path.getsize(out_path)} bytes)")

def generate_listening_video():
    print("Generating professor_listening.mp4...")
    base, speak, blink, h, w = load_images()
    
    fps = 30
    duration = 4.0 # 4 seconds seamless loop
    total_frames = int(fps * duration)
    
    frames = []
    for i in range(total_frames):
        t = i / fps
        progress = i / total_frames # 0.0 to 1.0
        
        # 1. Seamless natural breathing (sine period 4s)
        breath = math.sin(2 * math.pi * progress)
        dy = breath * 1.8
        dx = math.sin(4 * math.pi * progress) * 0.4
        zoom = 1.0 + (breath * 0.002) # subtle 0.2% breathing expansion
        
        # 2. Attentive nod acknowledging user input around t = 1.3s to 1.9s
        if 1.2 <= t <= 1.8:
            nod_phase = (t - 1.2) / 0.6
            nod = math.sin(nod_phase * math.pi) ** 2
            dy += nod * 2.2
            dx -= nod * 0.5
            
        # 3. Eye blinking:
        # Blink 1: at t = 2.4s (realistic ~0.22s duration)
        blink_weight = 0.0
        if 2.25 <= t <= 2.55:
            # Gaussian or smooth bell curve for natural eyelid drop & snap open
            dt = (t - 2.4) / 0.08
            blink_weight = max(0.0, math.exp(-dt * dt))
            
        # Blink 2: micro attentive blink at t = 3.65s
        if 3.55 <= t <= 3.75:
            dt = (t - 3.65) / 0.06
            blink_weight = max(blink_weight, math.exp(-dt * dt) * 0.85)
            
        # Blend base and blink for eyes
        if blink_weight > 0.01:
            frame_blend = cv2.addWeighted(base, 1.0 - blink_weight, blink, blink_weight, 0)
        else:
            frame_blend = base.copy()
            
        # Apply smooth motion
        final_frame = apply_motion(frame_blend, dx, dy, zoom)
        frames.append(final_frame)
        
    write_video_ffmpeg(frames, OUT_LISTEN_PATH, fps)

def generate_speaking_video():
    print("Generating professor_speaking.mp4...")
    base, speak, blink, h, w = load_images()
    
    fps = 30
    duration = 3.6 # 3.6 seconds seamless loop
    total_frames = int(fps * duration)
    
    # Syllables pattern for natural Vietnamese academic questioning speech
    # Each syllable has an active peak, varied opening (0.2 to 1.0)
    syllable_times = [
        (0.2, 0.75),  # Thưa...
        (0.45, 0.5),  # em...
        (0.75, 0.9),  # theo...
        (1.0, 0.6),   # tôi...
        (1.25, 0.85), # thấy...
        (1.6, 0.7),   # luận...
        (1.85, 0.95), # án...
        (2.15, 0.5),  # này...
        (2.4, 0.8),   # cần...
        (2.7, 0.9),   # giải...
        (2.95, 0.65), # thích...
        (3.25, 0.4),  # rõ...
    ]
    
    frames = []
    for i in range(total_frames):
        t = i / fps
        progress = i / total_frames
        
        # Compute mouth openness from syllables
        mouth_open = 0.0
        for s_time, s_intensity in syllable_times:
            dist = abs(t - s_time)
            if dist < 0.14:
                # Smooth cosine bell curve
                val = 0.5 * (1 + math.cos(math.pi * dist / 0.14)) * s_intensity
                mouth_open = max(mouth_open, val)
                
        # Breathing and speech rhythm motion
        speech_bob = math.sin(2 * math.pi * progress * 3) * 1.5
        dy = speech_bob + math.sin(2 * math.pi * progress) * 1.2
        dx = math.sin(2 * math.pi * progress * 2) * 0.8
        zoom = 1.0 + math.sin(2 * math.pi * progress) * 0.003
        
        # Subtle head gesture emphasis when mouth opens wider
        dy += mouth_open * 1.6
        
        # Natural speech blink around t = 1.8s
        blink_weight = 0.0
        if 1.7 <= t <= 1.95:
            dt = (t - 1.82) / 0.07
            blink_weight = max(0.0, math.exp(-dt * dt))
            
        # Base frame synthesis:
        # First blend mouth
        if mouth_open > 0.02:
            frame_content = cv2.addWeighted(base, 1.0 - mouth_open, speak, mouth_open, 0)
        else:
            frame_content = base.copy()
            
        # Then blend blink if blinking
        if blink_weight > 0.02:
            frame_content = cv2.addWeighted(frame_content, 1.0 - blink_weight, blink, blink_weight, 0)
            
        # Apply motion
        final_frame = apply_motion(frame_content, dx, dy, zoom)
        frames.append(final_frame)
        
    write_video_ffmpeg(frames, OUT_SPEAK_PATH, fps)

if __name__ == "__main__":
    generate_listening_video()
    generate_speaking_video()
