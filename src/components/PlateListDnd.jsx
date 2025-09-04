// src/components/PlateListDnd.jsx
import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import PlateItem from "./PlateItem.jsx";

function reorder(list, startIndex, endIndex) {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

export default function PlateListDnd({ plates, onReorder, onCommit, onRemove }) {
  function onDragEnd(result) {
    const { destination, source } = result;
    if (!destination) return;
    if (destination.index === source.index) return;
    onReorder(reorder(plates, source.index, destination.index));
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="plates-droppable">
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            {plates.map((p, idx) => (
              <Draggable draggableId={p.id} index={idx} key={p.id}>
                {(draggableProvided, snapshot) => (
                  <div
                    ref={draggableProvided.innerRef}
                    {...draggableProvided.draggableProps}
                    style={{
                      ...draggableProvided.draggableProps.style,
                      opacity: snapshot.isDragging ? 0.9 : 1,
                    }}
                  >
                    <PlateItem
                      index={idx}
                      plate={p}
                      onCommit={(next) => onCommit(p.id, next)}
                      onRemove={() => onRemove(p.id)}
                      canRemove={plates.length > 1}
                      // pass handle props so only the index badge acts as the drag handle
                      dragHandleProps={draggableProvided.dragHandleProps}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
