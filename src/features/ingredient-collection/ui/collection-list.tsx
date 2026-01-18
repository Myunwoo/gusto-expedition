'use client';

import { useState } from 'react';
import {
  useIngredientCollection,
  useIngredientCreateCollection,
  useIngredientDeleteCollection,
} from '@/entities/ingredient/api/ingredientQueries';

export const CollectionList = () => {
  const [selectedCollectionId, setSelectedCollectionId] = useState<number | null>(null);
  const [newCollectionName, setNewCollectionName] = useState('');

  // 컬렉션 조회 (staleTime: 30초, refetchOnWindowFocus: true, retry: 3회)
  const { data: collection, isLoading } = useIngredientCollection(
    selectedCollectionId || 0
  );

  // 컬렉션 생성 Mutation
  const createCollectionMutation = useIngredientCreateCollection();

  // 컬렉션 삭제 Mutation
  const deleteCollectionMutation = useIngredientDeleteCollection();

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;

    await createCollectionMutation.mutateAsync({ name: newCollectionName });
    setNewCollectionName('');
  };

  const handleDeleteCollection = async (id: number) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      await deleteCollectionMutation.mutateAsync(id);
      if (selectedCollectionId === id) {
        setSelectedCollectionId(null);
      }
    }
  };

  return (
    <div>
      <h2>재료 컬렉션</h2>

      {/* 컬렉션 생성 폼 */}
      <form onSubmit={handleCreateCollection}>
        <input
          type="text"
          value={newCollectionName}
          onChange={(e) => setNewCollectionName(e.target.value)}
          placeholder="컬렉션 이름"
        />
        <button type="submit" disabled={createCollectionMutation.isPending}>
          {createCollectionMutation.isPending ? '생성 중...' : '생성'}
        </button>
      </form>

      {/* 컬렉션 상세 조회 예시 */}
      {selectedCollectionId && (
        <div>
          <h3>컬렉션 상세</h3>
          {isLoading ? (
            <div>로딩 중...</div>
          ) : collection ? (
            <div>
              <p>이름: {collection.name}</p>
              <button onClick={() => handleDeleteCollection(collection.id)}>
                삭제
              </button>
            </div>
          ) : (
            <div>컬렉션을 찾을 수 없습니다.</div>
          )}
        </div>
      )}

      {/* TODO: 컬렉션 목록 표시 */}
    </div>
  );
};

