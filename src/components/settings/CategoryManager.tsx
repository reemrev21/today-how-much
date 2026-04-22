import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import {useTheme} from '../../styles/theme';
import {getCategories, setCategories} from '../../store/settings';

export function CategoryManager(): React.JSX.Element {
  const theme = useTheme();
  const [categories, setCategoriesState] = useState<string[]>(() => getCategories());
  const [newCategory, setNewCategory] = useState('');

  const handleAdd = useCallback(() => {
    const trimmed = newCategory.trim();
    if (!trimmed) {return;}
    if (categories.includes(trimmed)) {
      Alert.alert('중복', '이미 존재하는 카테고리입니다.');
      return;
    }
    const updated = [...categories, trimmed];
    setCategories(updated);
    setCategoriesState(updated);
    setNewCategory('');
  }, [newCategory, categories]);

  const handleDelete = useCallback(
    (category: string) => {
      Alert.alert(
        '카테고리 삭제',
        `"${category}" 카테고리를 삭제하시겠습니까?`,
        [
          {text: '취소', style: 'cancel'},
          {
            text: '삭제',
            style: 'destructive',
            onPress: () => {
              const updated = categories.filter(c => c !== category);
              setCategories(updated);
              setCategoriesState(updated);
            },
          },
        ],
      );
    },
    [categories],
  );

  return (
    <View>
      {categories.map(category => (
        <View key={category} style={[styles.item, {borderBottomColor: theme.border}]}>
          <Text style={[styles.itemText, {color: theme.text}]}>{category}</Text>
          <TouchableOpacity onPress={() => handleDelete(category)} activeOpacity={0.7}>
            <Text style={[styles.deleteBtn, {color: theme.expense}]}>삭제</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* Add new */}
      <View style={styles.addRow}>
        <TextInput
          style={[styles.addInput, {color: theme.text, borderColor: theme.border, backgroundColor: theme.card}]}
          placeholder="새 카테고리"
          placeholderTextColor={theme.textSecondary}
          value={newCategory}
          onChangeText={setNewCategory}
          onSubmitEditing={handleAdd}
          returnKeyType="done"
        />
        <TouchableOpacity
          style={[styles.addBtn, {backgroundColor: theme.primary}]}
          onPress={handleAdd}
          activeOpacity={0.7}
        >
          <Text style={[styles.addBtnText, {color: '#fff'}]}>추가</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  itemText: {fontSize: 14},
  deleteBtn: {fontSize: 13, fontWeight: '600'},
  addRow: {flexDirection: 'row', marginTop: 12, gap: 8},
  addInput: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 14,
  },
  addBtn: {
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {fontSize: 14, fontWeight: '600'},
});
