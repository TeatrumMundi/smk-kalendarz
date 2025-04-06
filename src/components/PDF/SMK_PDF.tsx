// src/components/pdf/PDFDocument.tsx
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { ColoredRange } from '@/types/Period';

Font.register({
    family: 'Roboto',
    src: '/fonts/Roboto-Regular.ttf',
});

const styles = StyleSheet.create({
    page: { padding: 40, fontSize: 11, fontFamily: 'Roboto' },
    heading: { fontSize: 16, marginBottom: 10 },
    section: { marginBottom: 10 },
    line: { marginBottom: 4 },
    image: { width: '100%', height: '100%' },
});

interface Props {
    coloredRanges: ColoredRange[];
    periods: { start: string; end: string }[];
}

export const SMK_PDF = ({ coloredRanges, periods }: Props) => {
    return (
        <Document>
            {/* 🖼️ Page 1: Landing Image */}
            <Page size="A4">
                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                <Image src="/PDF_LandingPage.png" style={styles.image} />
            </Page>

            {/* 📊 Page 2: Summary */}
            <Page size="A4" style={styles.page}>
                <Text style={styles.heading}>Podsumowanie zakresów</Text>
                {coloredRanges.map((range, i) => (
                    <View key={i} style={styles.line}>
                        <Text>
                            {range.type} {range.label ? `(${range.label})` : ''}: {range.start} - {range.end}
                        </Text>
                    </View>
                ))}
            </Page>

            {/* 📅 Pages: one per year */}
            {periods.map((period, idx) => (
                <Page key={idx} size="A4" style={styles.page}>
                    <Text style={styles.heading}>Zakresy - Rok {idx + 1}</Text>
                    {coloredRanges
                        .filter(r => r.start <= period.end && r.end >= period.start)
                        .map((range, i) => (
                            <Text key={i} style={styles.line}>
                                {range.type} {range.label ? `(${range.label})` : ''}: {range.start} - {range.end}
                            </Text>
                        ))}
                </Page>
            ))}
        </Document>
    );
};
