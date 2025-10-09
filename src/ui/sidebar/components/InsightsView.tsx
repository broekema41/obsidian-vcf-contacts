import * as React from "react";
import { useEffect, useRef, useState } from "react";

import { insightService } from "src/insights/insightService";
import { insightQueueStore } from "src/insights/insightsQueStore";
import { useOutsideClickHook } from "src/ui/hooks/outsideClickHook";

type ActionProps = {
  setDisplayInsightsView: (displayActionView: boolean) => void;
};



export const InsightsView = (props: ActionProps) => {
  const [loading, setLoading] = useState(true);
  const [insightItems, setInsightItems] = useState<React.ReactNode[]>([]);

  const wrapperRef = useRef<HTMLDivElement>(null);
  useOutsideClickHook(wrapperRef, () => {
    props.setDisplayInsightsView(false)
  });

  useEffect(() => {
    const unsubscribe = insightService.backgroundProcessRunning.subscribe((loading) => {
      setLoading(loading);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    renderInsights();
  }, []);

  function renderInsights() {
      const processorNames = insightQueueStore.getProcessorsInStore();
      for (const processorName of processorNames) {
        const items = insightQueueStore.getByName(processorName);
        const processor = insightService.getProcessorByName(processorName)
        if(processor) {
          for (const queItem of items) {
            const singleItem = processor.render({
              queItem,
              closeItem: () => {

              }
            })
            setInsightItems(prev => [...prev, singleItem]);

          }
        }
      }
  }


  return (
    <div ref={wrapperRef} className="contacts-view">

      {loading ? (
        <div className="progress-bar progress-bar--contacts">
          <div className="progress-bar-message u-center-text">Loading Insights...</div>
          <div className="progress-bar-indicator">
            <div className="progress-bar-line"></div>
            <div className="progress-bar-subline mod-increase"></div>
            <div className="progress-bar-subline mod-decrease"></div>
          </div>
        </div>
      ) : (
        <div className="contacts-view-close" >
          <div className="modal-close-button" onClick={() => props.setDisplayInsightsView(false)}></div>
        </div>
      )}

      {
        !loading ? (
          insightItems.length === 0 ? (
                  <div className="action-card">
                    <div className="action-card-content action-card-content--no-height">
                      <p>No insights available.</p>
                    </div>
                  </div>
              ) : null
        ) : null
      }

      {
        !loading && insightItems.length > 0
          ? insightItems
          : null
      }
    </div>
  )
}
