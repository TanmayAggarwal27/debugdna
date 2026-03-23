(function(window) {
  const DebugDNA = {
    projectId: null,
    endpoint: null,
    sessionId: null,
    events: [],
    sessionStart: Date.now(),
    initialized: false,

    init: function(config) {
      if (this.initialized) return;
      this.projectId = config.projectId;
      this.endpoint = config.endpoint;
      
      this.sessionId = this._generateId();
      try {
        if (window.sessionStorage) {
          let stored = window.sessionStorage.getItem('debugdna_session_id');
          if (stored) {
            this.sessionId = stored;
          } else {
            window.sessionStorage.setItem('debugdna_session_id', this.sessionId);
          }
        }
      } catch (e) {}

      this._monkeyPatchFetch();
      this._captureDOMEvents();
      this._captureConsoleErrors();
      this._captureUncaughtErrors();
      this._startHeartbeat();
      this.initialized = true;
    },

    _generateId: function() {
      if (window.crypto && window.crypto.randomUUID) {
        return window.crypto.randomUUID();
      }
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    },

    _monkeyPatchFetch: function() {
      const originalFetch = window.fetch;
      if (!originalFetch) return;
      
      const self = this;
      window.fetch = async function(...args) {
        const url = args[0];
        let endpoint = typeof url === 'string' ? url : (url && url.url ? url.url : 'unknown');
        
        // Don't track requests to our own ingest endpoint
        if (self.endpoint && endpoint.includes(self.endpoint)) {
          return originalFetch.apply(this, args);
        }

        let method = 'GET';
        if (args[1] && args[1].method) {
          method = args[1].method.toUpperCase();
        } else if (url && url.method) {
          method = url.method.toUpperCase();
        }

        const event = {
          t: Date.now() - self.sessionStart,
          type: 'api_call',
          endpoint: endpoint,
          method: method
        };
        self.events.push(event);

        try {
          const response = await originalFetch.apply(this, args);
          event.status = response.status;
          
          // Clone the response so we don't consume the stream
          const clone = response.clone();
          try {
            const text = await clone.text();
            try {
              event.value = JSON.parse(text); // parse JSON to enable causality tracking of 'null' values inside the payload
            } catch (jsonErr) {
              event.value = text.substring(0, 500);
            }
          } catch (e) {
            event.value = 'Unreadable body';
          }
          return response;
        } catch (error) {
          event.status = 0;
          event.error = error.message;
          throw error;
        }
      };
    },

    _captureDOMEvents: function() {
      const self = this;
      const handler = function(e) {
        try {
          const target = e.target;
          if (!target) return;
          const tag = target.tagName ? target.tagName.toLowerCase() : 'unknown';
          self.events.push({
            t: Date.now() - self.sessionStart,
            type: 'user_action',
            element: tag,
            eventAction: e.type
          });
        } catch (err) {}
      };
      
      window.document.addEventListener('click', handler, true);
      window.document.addEventListener('input', handler, true);
      window.document.addEventListener('change', handler, true);
    },

    _captureConsoleErrors: function() {
      const originalError = console.error;
      if (!originalError) return;
      
      const self = this;
      console.error = function(...args) {
        try {
          const val = args.map(a => {
            if (a instanceof Error) return a.message;
            if (typeof a === 'object') {
              try { return JSON.stringify(a).substring(0, 500); } catch (e) { return 'Object'; }
            }
            return String(a);
          }).join(' ');
          
          self.events.push({
            t: Date.now() - self.sessionStart,
            type: 'console_error',
            value: val
          });
        } catch (err) {}
        
        return originalError.apply(this, args);
      };
    },

    _captureUncaughtErrors: function() {
      const self = this;
      
      window.addEventListener('error', function(e) {
        self.events.push({
          t: Date.now() - self.sessionStart,
          type: 'CRASH',
          error: e.message,
          stack: e.error && e.error.stack ? e.error.stack : ''
        });
        self._flushEvents(true);
      });

      window.addEventListener('unhandledrejection', function(e) {
        self.events.push({
          t: Date.now() - self.sessionStart,
          type: 'CRASH',
          error: e.reason ? e.reason.message || String(e.reason) : 'Unhandled Rejection',
          stack: e.reason && e.reason.stack ? e.reason.stack : ''
        });
        self._flushEvents(true);
      });
    },

    _startHeartbeat: function() {
      const self = this;
      setInterval(function() {
        self._flushEvents();
      }, 30000);
    },

    _flushEvents: function(isCrash) {
      if (!this.endpoint || !this.projectId) return;
      if (this.events.length === 0) return;

      const payload = JSON.stringify({
        sessionId: this.sessionId,
        projectId: this.projectId,
        events: this.events
      });

      // Clear events immediately to avoid duplicates in next flush
      this.events = [];

      try {
        if (typeof navigator.sendBeacon === 'function') {
          navigator.sendBeacon(this.endpoint, payload);
        } else if (window.fetch) {
          window.fetch(this.endpoint, {
            method: 'POST',
            keepalive: true,
            headers: { 'Content-Type': 'application/json' },
            body: payload
          }).catch(() => {});
        }
      } catch (e) {}
    }
  };

  window.DebugDNA = DebugDNA;
})(window);
