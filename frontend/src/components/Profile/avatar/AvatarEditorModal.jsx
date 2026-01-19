import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faArrowLeft } from "@fortawesome/free-solid-svg-icons";

function clamp(v, min, max) {
    return Math.min(max, Math.max(min, v));
}

function clampOffsetToCircle({ img, zoom, offset, canvasSize }) {
    if (!img) return offset;

    const r = canvasSize * 0.45;
    const iw = img.width;
    const ih = img.height;

    const baseScale = Math.max(canvasSize / iw, canvasSize / ih);
    const scale = baseScale * zoom;

    const drawW = iw * scale;
    const drawH = ih * scale;

    const maxX = Math.max(0, drawW / 2 - r);
    const maxY = Math.max(0, drawH / 2 - r);

    return {
        x: clamp(offset.x, -maxX, maxX),
        y: clamp(offset.y, -maxY, maxY),
    };
}

function AvatarEditorModal({
                               styles,
                               isOpen,
                               onClose,
                               onBack,
                               onApply,
                               initialSrc,
                               isSaving,
                           }) {
    const canvasRef = useRef(null);
    const fileRef = useRef(null);
    const dragScaleRef = useRef(1);

    const [imgSrc, setImgSrc] = useState(initialSrc || "");
    const [imgObj, setImgObj] = useState(null);
    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    const [dragging, setDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [offsetStart, setOffsetStart] = useState({ x: 0, y: 0 });

    const getPointerScale = () => {
        const canvas = canvasRef.current;
        if (!canvas) return 1;
        const rect = canvas.getBoundingClientRect();
        if (!rect.width) return 1;
        return canvas.width / rect.width;
    };

    useEffect(() => {
        if (!isOpen) return;
        setImgSrc(initialSrc || "");
        setZoom(1);
        setOffset({ x: 0, y: 0 });
        setImgObj(null);
        setDragging(false);
    }, [isOpen, initialSrc]);

    useEffect(() => {
        if (!isOpen) return;

        if (!imgSrc) {
            setImgObj(null);
            redraw(null, zoom, offset);
            return;
        }

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            setImgObj(img);
            setZoom(1);
            setOffset({ x: 0, y: 0 });
            redraw(img, 1, { x: 0, y: 0 });
        };
        img.src = imgSrc;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [imgSrc, isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        redraw(imgObj, zoom, offset);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [zoom, offset, imgObj, isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        if (!imgObj) return;

        const clamped = clampOffsetToCircle({
            img: imgObj,
            zoom,
            offset,
            canvasSize: canvasRef.current?.width || 300,
        });

        if (clamped.x !== offset.x || clamped.y !== offset.y) {
            setOffset(clamped);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [zoom, imgObj, isOpen]);

    const redraw = (img, z, off) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        const size = canvas.width;

        ctx.clearRect(0, 0, size, size);

        ctx.fillStyle = "#f2f3f5";
        ctx.fillRect(0, 0, size, size);

        if (!img) {
            ctx.fillStyle = "rgba(0,0,0,0.4)";
            ctx.font = '800 14px "Poppins", system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif';
            ctx.textAlign = "center";
            ctx.fillText("Chọn ảnh để cập nhật", size / 2, size / 2);
            return;
        }

        const cx = size / 2;
        const cy = size / 2;

        const iw = img.width;
        const ih = img.height;

        const baseScale = Math.max(size / iw, size / ih);
        const scale = baseScale * z;

        const drawW = iw * scale;
        const drawH = ih * scale;

        const safeOff = clampOffsetToCircle({
            img,
            zoom: z,
            offset: off,
            canvasSize: size,
        });

        const x = cx - drawW / 2 + safeOff.x;
        const y = cy - drawH / 2 + safeOff.y;

        ctx.drawImage(img, x, y, drawW, drawH);

        ctx.save();
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.beginPath();
        ctx.rect(0, 0, size, size);
        ctx.arc(cx, cy, size * 0.45, 0, Math.PI * 2, true);
        ctx.fill("evenodd");
        ctx.restore();

        ctx.save();
        ctx.strokeStyle = "rgba(255,255,255,0.9)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, size * 0.45, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    };

    const exportCircleAvatar = (img, z, off) => {
        if (!img) return "";

        const outSize = 512;
        const outCanvas = document.createElement("canvas");
        outCanvas.width = outSize;
        outCanvas.height = outSize;

        const ctx = outCanvas.getContext("2d");
        ctx.clearRect(0, 0, outSize, outSize);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        const cx = outSize / 2;
        const cy = outSize / 2;
        const radius = outSize * 0.45;

        const iw = img.width;
        const ih = img.height;

        const baseScale = Math.max(outSize / iw, outSize / ih);
        const scale = baseScale * z;

        const drawW = iw * scale;
        const drawH = ih * scale;

        const safeOff = clampOffsetToCircle({
            img,
            zoom: z,
            offset: off,
            canvasSize: outSize,
        });

        const x = cx - drawW / 2 + safeOff.x;
        const y = cy - drawH / 2 + safeOff.y;

        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        ctx.drawImage(img, x, y, drawW, drawH);
        ctx.restore();

        return outCanvas.toDataURL("image/png");
    };

    const openFilePicker = () => fileRef.current?.click();

    const onFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setImgSrc(String(reader.result || ""));
        reader.readAsDataURL(file);
        e.target.value = "";
    };

    const onPointerDown = (e) => {
        if (!imgObj) return;
        dragScaleRef.current = getPointerScale();

        setDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
        setOffsetStart(offset);

        const canvas = canvasRef.current;
        if (canvas && e.pointerId != null) {
            try {
                canvas.setPointerCapture(e.pointerId);
            } catch (e2) {
                void e2;
            }
        }
    };

    const onPointerMove = (e) => {
        if (!dragging) return;
        if (!imgObj) return;

        const scale = dragScaleRef.current || 1;
        const dx = (e.clientX - dragStart.x) * scale;
        const dy = (e.clientY - dragStart.y) * scale;

        const next = { x: offsetStart.x + dx, y: offsetStart.y + dy };

        const clamped = clampOffsetToCircle({
            img: imgObj,
            zoom,
            offset: next,
            canvasSize: canvasRef.current?.width || 300,
        });

        setOffset(clamped);
    };

    const stopDragging = () => setDragging(false);

    const handleApply = () => {
        if (!imgObj) {
            onBack?.();
            return;
        }

        const previewSize = canvasRef.current?.width || 300;
        const outSize = 512;
        const ratio = outSize / previewSize;

        const safeOff = clampOffsetToCircle({
            img: imgObj,
            zoom,
            offset,
            canvasSize: previewSize,
        });

        const scaledOff = { x: safeOff.x * ratio, y: safeOff.y * ratio };

        const out = exportCircleAvatar(imgObj, zoom, scaledOff);
        onApply(out);
    };

    const handleRemove = () => {
        onApply("");
    };

    return (
        <div className={styles.panel} style={{ pointerEvents: isOpen ? "auto" : "none" }}>
            <div className={styles.header}>
                <button className={styles.iconBtn} onClick={onBack} disabled={isSaving}>
                    <FontAwesomeIcon icon={faArrowLeft} />
                </button>
                <span className={styles.title}>Cập nhật ảnh đại diện</span>
                <button className={styles.iconBtn} onClick={onClose} disabled={isSaving}>
                    <FontAwesomeIcon icon={faTimes} />
                </button>
            </div>

            <div className={styles.editorBody}>
                <div className={styles.canvasWrap}>
                    <canvas
                        ref={canvasRef}
                        width={300}
                        height={300}
                        className={styles.canvas}
                        onPointerDown={onPointerDown}
                        onPointerMove={onPointerMove}
                        onPointerUp={stopDragging}
                        onPointerCancel={stopDragging}
                        onPointerLeave={stopDragging}
                        style={{ touchAction: "none" }}
                    />
                    <div className={styles.dragHint}>Kéo để di chuyển</div>
                </div>

                <div className={styles.zoomRow}>
          <span className={styles.zoomBtn} aria-hidden>
            –
          </span>
                    <input
                        className={styles.zoom}
                        type="range"
                        min="1"
                        max="2.5"
                        step="0.01"
                        value={zoom}
                        onChange={(e) => setZoom(Number(e.target.value))}
                    />
                    <span className={styles.zoomBtn} aria-hidden>
            +
          </span>
                </div>

                <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className={styles.fileInput}
                    onChange={onFileChange}
                />

                <div className={styles.editorActions}>
                    <button className={styles.pickBtn} onClick={openFilePicker} disabled={isSaving}>
                        Chọn ảnh từ máy
                    </button>
                    <button className={styles.removeBtn} onClick={handleRemove} disabled={isSaving}>
                        Xóa ảnh
                    </button>
                </div>
            </div>

            <div className={styles.footer}>
                <button className={styles.cancelBtn} onClick={onBack} disabled={isSaving}>
                    Hủy
                </button>
                <button
                    className={styles.saveBtn}
                    onClick={handleApply}
                    disabled={!imgObj || isSaving}
                >
                    {isSaving ? "Đang lưu..." : "Cập nhật"}
                </button>
            </div>
        </div>
    );
}

export default AvatarEditorModal;
