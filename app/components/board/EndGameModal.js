import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import * as Animatable from 'react-native-animatable';

const EndGameModal = ({ visible, finalScore, myPlayerId, onReplay, onQuit }) => {
    if (!finalScore) return null;

    const { winner, player1, player2 } = finalScore;

    const isDraw = winner === 'draw';
    const isWinner = winner === myPlayerId;

    const getTitle = () => {
        if (isDraw) return 'Match nul 🤝';
        if (isWinner) return 'Victoire 🏆';
        return 'Défaite 😓';
    };

    const getTitleStyle = () => {
        if (isDraw) return styles.titleDraw;
        if (isWinner) return styles.titleWin;
        return styles.titleLose;
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.modalOverlay}>
                <Animatable.View
                    animation="zoomIn"
                    duration={600}
                    style={styles.modalContent}
                >
                    <Animatable.Text
                        animation="pulse"
                        iterationCount="infinite"
                        easing="ease-in-out"
                        style={[styles.title, getTitleStyle()]}
                    >
                        {getTitle()}
                    </Animatable.Text>

                    <View style={styles.scoreContainer}>
                        <Text style={styles.scoreText}>🟦 Joueur 1 : {player1}</Text>
                        <Text style={styles.scoreText}>🟥 Joueur 2 : {player2}</Text>
                    </View>

                    {!isDraw && (
                        <Text style={styles.resultText}>
                            {winner === 'player:1' ? '🟦' : '🟥'} {winner} a gagné !
                        </Text>
                    )}

                    <View style={styles.buttonGroup}>
                        <Animatable.View animation="bounceIn" delay={300}>
                            <Pressable onPress={onReplay} style={styles.buttonReplay}>
                                <Text style={styles.buttonText}>🔄 Rejouer</Text>
                            </Pressable>
                        </Animatable.View>
                        <Animatable.View animation="bounceIn" delay={500}>
                            <Pressable onPress={onQuit} style={styles.buttonQuit}>
                                <Text style={styles.buttonText}>🚪 Quitter</Text>
                            </Pressable>
                        </Animatable.View>
                    </View>
                </Animatable.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: '#000000aa',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#1e1e2e',
        padding: 30,
        borderRadius: 30,
        width: '85%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.6,
        shadowRadius: 10,
        elevation: 10,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    titleWin: {
        color: '#4caf50',
        textShadowColor: '#a5ffb0',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
    titleLose: {
        color: '#f44336',
        textShadowColor: '#ffaaaa',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 8,
    },
    titleDraw: {
        color: '#ffc107',
        textShadowColor: '#fff59d',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 6,
    },
    scoreContainer: {
        marginBottom: 20,
    },
    scoreText: {
        fontSize: 20,
        color: '#ffffffcc',
        marginBottom: 5,
    },
    resultText: {
        fontSize: 18,
        color: '#cccccc',
        marginBottom: 20,
        fontStyle: 'italic',
    },
    buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 20,
    },
    buttonReplay: {
        backgroundColor: '#4caf50',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 12,
    },
    buttonQuit: {
        backgroundColor: '#f44336',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 12,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
    },
});

export default EndGameModal;
