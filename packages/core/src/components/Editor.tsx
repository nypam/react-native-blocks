import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Pressable, View } from "react-native";
import { LayoutProvider } from "./LayoutProvider";
import { useKeyboardStatus } from "../hooks/useKeyboardStatus";
import { BlocksProvider, BlocksChange, useBlocksContext } from "./BlocksContext";
import { BlockRegistration, useBlockRegistrationContext } from "./BlockRegistration";
import { TextBlocksProvider, useTextBlocksContext } from "./TextBlocksProvider";
import { ScrollProvider } from "./ScrollProvider";
import { BlocksMeasuresProvider } from "./BlocksMeasuresProvider";

/**
 * Blank space component.
 * Review the handleOnBlankSpacePress function. Add necessary documentation and clean up the code.
 */
const BlankSpace = ({ onBlankSpacePress }) => {
    const { keyboardHeight } = useKeyboardStatus();
    const {
        blocks,
        blocksOrder,
        insertBlock,
        updateBlockV2,
        removeBlock
    } = useBlocksContext();
    const { inputRefs } = useTextBlocksContext();

    const handleBlankSpacePress = () => onBlankSpacePress({
        blocks,
        blocksOrder,
        insertBlock,
        inputRefs
    });

    return (
        <Pressable
            onPress={handleBlankSpacePress}
            style={{
                flexGrow: 1,
                minHeight: keyboardHeight + 64,
                backgroundColor: "transparent"
            }}
        />
    )
};

interface RenderTreeProps {
    onBlankSpacePress: () => void
}
function RenderTree(props: RenderTreeProps) {
    const {
        onBlankSpacePress
    } = props;
    const { blockTypes, defaultBlockType } = useBlockRegistrationContext();
    const { blocks, blocksOrder } = useBlocksContext();

    return (
        <>
            {/* We concat the "root" content (should be just one item) with the content of its only child. */}
            {blocksOrder.map((blockId: string, index: number) => {
                const Component = blockTypes[blocks[blockId].type].component;
                return (
                    <LayoutProvider blockId={blockId} key={`block-${blockId}`}>
                            <View style={{ backgroundColor: "transparent" }}>
                                <Component blockId={blockId} />
                            </View>
                    </LayoutProvider>
                )
            })}

            <BlankSpace onBlankSpacePress={onBlankSpacePress}/>
        </>
    )
}

interface EditorProps {
    children: React.ReactNode
    defaultBlockType: string
    /** @deprecated Use `onChange`. Receives the live blocks object, which keeps being mutated. */
    extractBlocks?: (blocks: any) => any
    /**
     * Fires after the page is edited, including while typing. Edits are batched (500ms) and
     * flushed right away when the app leaves the foreground or the editor unmounts.
     */
    onChange?: (change: BlocksChange) => void
    defaultBlocks?: any
    contentContainerStyle?: any
    /** Component to render above the keyboard */
    ToolbarComponent?: any
    /** Fires when a blank space is pressed */
    onBlankSpacePress?: any
}

export function Editor(props : EditorProps) {
    const {
        children,

        // Todo: Deprecate defaultBlockType
        defaultBlockType,

        extractBlocks,
        onChange,
        defaultBlocks,
        contentContainerStyle,
        ToolbarComponent,

        // Experimental
        onBlankSpacePress
    } = props;

    if (defaultBlockType === undefined) throw new Error("defaultBlockType is required");
    if (children === undefined) throw new Error("children is required");

    return (
        <BlockRegistration customBlocks={children} defaultBlockType={defaultBlockType}>
            <BlocksProvider
                defaultBlocks={defaultBlocks}
                extractBlocks={extractBlocks}
                onChange={onChange}
            >
                <TextBlocksProvider>
                    <GestureHandlerRootView>
                        <BlocksMeasuresProvider>
                            <ScrollProvider contentContainerStyle={contentContainerStyle}>
                                <RenderTree
                                    onBlankSpacePress={onBlankSpacePress}
                                />
                            </ScrollProvider>
                        </BlocksMeasuresProvider>
                        
                        {ToolbarComponent && <ToolbarComponent />}
                    </GestureHandlerRootView>
                </TextBlocksProvider>
            </BlocksProvider>
        </BlockRegistration>
    )
}