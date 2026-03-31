// -*- coding: utf-8 -*-
// File: ConfirmDialog.jsx
// Created: 2026-03-29
// Author: zhuimeng
// Description: 确认对话框组件

import Modal from './Modal';
import Button from './Button';

export default function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title = '确认操作',
    message,
    confirmText = '确认',
    cancelText = '取消',
    variant = 'danger',
}) {
    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            size="sm"
            showCloseButton={false}
        >
            <div className="space-y-4">
                <p className="text-gray-700">{message}</p>
                <div className="flex justify-end gap-3 pt-4">
                    <Button variant="secondary" onClick={onClose}>
                        {cancelText}
                    </Button>
                    <Button variant={variant} onClick={handleConfirm}>
                        {confirmText}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
