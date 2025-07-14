
self.onmessage = function(e) {
    console.log('Worker received:', e.data);
    if (e.data.type === 'processDrawing') {
        const result = processDrawingData(e.data.payload);
        self.postMessage({
            type: 'drawingProcessed',
            payload: result
        });
    }
    function processDrawingData(data) {
        return { processed: true, data };
    }
};