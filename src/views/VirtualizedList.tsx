import React from "react";
import ResizeObserver from "resize-observer-polyfill";

interface VirtualizedItemProps<ItemProps, RefType> {
  onHeightChanged(key: string, heigh: number): void;
  itemProps: ItemProps;
  ItemComponent: React.ForwardRefExoticComponent<
    ItemProps & React.RefAttributes<RefType>
  >;
}

class VirtualizedItem<
  ItemProps extends { key: string },
  RefType extends HTMLElement
> extends React.PureComponent<VirtualizedItemProps<ItemProps, RefType>> {
  private _ref = React.createRef<RefType>();
  _resizeObserver?: ResizeObserver;

  private onHeightChanged = () => {
    if (this._ref.current) {
      this.props.onHeightChanged(
        this.props.itemProps.key,
        this._ref.current.offsetHeight
      );
    }
  };

  componentDidMount() {
    if (this._ref.current) {
      this._resizeObserver = new ResizeObserver(this.onHeightChanged);
      this._resizeObserver.observe(this._ref.current);
    }
  }

  componentWillUnmount() {
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = undefined;
    }
  }

  render() {
    const { ItemComponent, itemProps } = this.props;

    return <ItemComponent ref={this._ref} {...itemProps} />;
  }
}

interface VirtualizedListProps<ItemProps, RefType> {
  entries: ItemProps[];
  defaultHeight: number;
  scrollableContainerRef: React.RefObject<HTMLDivElement>;
  ItemComponent: React.ForwardRefExoticComponent<
    ItemProps & React.RefAttributes<RefType>
  >;
  PlaceholderComponent: React.ComponentType<{ height: number }>;
}

export function VirtualizedList<
  ItemProps extends { key: string; focused?: boolean },
  RefType extends HTMLElement
>(props: VirtualizedListProps<ItemProps, RefType>): JSX.Element {
  const [parentOffset, setParentOffset] = React.useState(0);
  const parentOffsetMeasuringRef = React.useRef<HTMLDivElement>(null);

  const [scrollY, setScrollY] = React.useState(0);
  const [windowHeight, setWindowHeight] = React.useState(window.innerHeight);

  const [realHeightsMap, setRealHeightsMap] = React.useState(new Map());
  // Beware of maintainig VirtualizedItem pureness during refactoring.
  // If one entry has changed it shouldn't lead to render() calls for other
  // entries.

  const onHeightChanged = React.useCallback((key: string, height: number) => {
    setRealHeightsMap((oldMap) => {
      const newMap = new Map(oldMap);

      newMap.set(key, height);
      return newMap;
    });
  }, []);

  const keys = new Set(props.entries.map((x) => x.key));
  const keysToDelete: string[] = [];
  realHeightsMap.forEach((_value, key) => {
    if (!keys.has(key)) {
      keysToDelete.push(key);
    }
  });
  if (keysToDelete.length > 0) {
    setRealHeightsMap((oldMap) => {
      const newMap = new Map(oldMap);
      keysToDelete.forEach((key) => {
        if (oldMap.has(key)) newMap.delete(key);
      });
      return newMap;
    });
  }

  React.useEffect(() => {
    const onResizeOrScroll = () => {
      if (props.scrollableContainerRef.current)
        setScrollY(props.scrollableContainerRef.current.scrollTop);
      setWindowHeight(window.innerHeight);

      if (parentOffsetMeasuringRef.current) {
        setParentOffset(parentOffsetMeasuringRef.current.offsetTop);
      }
    };
    if (props.scrollableContainerRef.current)
      props.scrollableContainerRef.current.onscroll = onResizeOrScroll;
    window.addEventListener("resize", onResizeOrScroll);
    return () => {
      window.removeEventListener("resize", onResizeOrScroll);
    };
  }, [props.scrollableContainerRef]);

  const visibleEntries: JSX.Element[] = [];
  let currentHeight = 0;
  let placeholderTop = 0;
  let placeholderBottom = 0;

  for (const entry of props.entries) {
    let entryHeight = props.defaultHeight;
    if (realHeightsMap.has(entry.key)) {
      entryHeight = realHeightsMap.get(entry.key);
    }

    if (
      currentHeight + entryHeight <
      scrollY - parentOffset - window.innerHeight
    ) {
      if (entry.focused && !!props.scrollableContainerRef.current) {
        props.scrollableContainerRef.current.scrollTop = currentHeight;
      }

      placeholderTop += entryHeight;
    } else if (currentHeight < scrollY - parentOffset + 2 * windowHeight) {
      visibleEntries.push(
        <VirtualizedItem
          key={entry.key}
          onHeightChanged={onHeightChanged}
          itemProps={entry}
          ItemComponent={props.ItemComponent}
        />
      );
    } else {
      if (entry.focused && props.scrollableContainerRef.current) {
        props.scrollableContainerRef.current.scrollTop = currentHeight;
      }

      placeholderBottom += entryHeight;
    }
    currentHeight += entryHeight;
  }
  if (placeholderTop !== 0) {
    visibleEntries.unshift(
      <props.PlaceholderComponent
        height={placeholderTop}
        key="placeholderTop"
      />
    );
  }

  if (placeholderBottom !== 0) {
    visibleEntries.push(
      <props.PlaceholderComponent
        height={placeholderBottom}
        key="placeholderBottom"
      />
    );
  }

  return (
    <React.Fragment>
      <div ref={parentOffsetMeasuringRef}></div>
      {visibleEntries}
    </React.Fragment>
  );
}
